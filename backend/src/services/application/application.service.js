import { StudentProfile } from "../../models/StudentProfile.model.js";
import { PlacementDrive } from "../../models/PlacementDrive.model.js";
import { Application } from "../../models/Application.model.js";
import { checkEligibility } from "../eligibility/eligibility.service.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Application status transition rules.
 *
 * WHAT: A plain JavaScript object mapping each status to the list of
 *       statuses it's allowed to move to next.
 * WHY: Without this, nothing stops a bad request (or a bug) from moving
 *      an application straight from APPLIED to OFFERED, skipping every
 *      real step in between. A single object, checked with
 *      `.includes()`, is enough — no state-machine library needed.
 * WHERE: Enforced in updateApplicationStatus() below, which is the only
 *        place an application's status is allowed to change after
 *        creation.
 *
 * WITHDRAWN is reachable from every non-terminal state because a student
 * can withdraw at any point before a final outcome — but withdrawal
 * itself is a student-initiated action, not something a recruiter sets
 * (see the explicit guard in updateApplicationStatus).
 */
export const ALLOWED_TRANSITIONS = {
  APPLIED: ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
  SHORTLISTED: ["OA_CLEARED", "REJECTED", "WITHDRAWN"],
  OA_CLEARED: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["OFFERED", "REJECTED", "WITHDRAWN"],
  OFFERED: [],
  REJECTED: [],
  WITHDRAWN: [],
};


/**
 * Finds the StudentProfile for a given User id, or throws.
 * Small helper reused by every student-facing service function below,
 * since every one of them needs to resolve "logged-in user" -> "profile".
 */
async function getProfileOrThrow(userId) {
  const profile = await StudentProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError("Student profile not found for this account", 404);
  }
  return profile;
}

/**
 * Applies a student to a drive.
 *
 * WHAT this enforces, in order:
 * 1. The drive exists.
 * 2. The drive is OPEN (not DRAFT/CLOSED/COMPLETED).
 * 3. The deadline has not passed.
 * 4. The student has a resume on file — a resume is required before
 *    applying to any drive.
 * 5. The student is actually eligible (re-checked here — never trust
 *    a client-side eligibility flag from an earlier page load).
 * 6. No duplicate application exists (enforced by the DB's unique
 *    compound index on (student, drive); we simply translate the
 *    resulting MongoDB error into a clean message).
 *
 * WHY re-check eligibility here even though the listing/details pages
 * already show it: a TPO could tighten a drive's criteria, or a
 * student's backlog count could change, between the student loading the
 * page and clicking "Apply". The server is the only source of truth
 * that can't be bypassed.
 */
async function applyToDrive(userId, driveId) {
  const studentProfile = await getProfileOrThrow(userId);

  const drive = await PlacementDrive.findById(driveId);
  if (!drive) {
    throw new AppError("Placement drive not found", 404);
  }

  if (drive.status !== "OPEN") {
    throw new AppError("This drive is not currently accepting applications", 400);
  }

  if (drive.deadline.getTime() < Date.now()) {
    throw new AppError("The application deadline for this drive has passed", 400);
  }

  if (!studentProfile.resumeUrl) {
    throw new AppError("Please add your resume before applying.", 400);
  }

  const { eligible, reasons } = checkEligibility(studentProfile, drive.eligibilityCriteria);
  if (!eligible) {
    const error = new AppError("You are not eligible for this drive", 403);
    error.errors = reasons.map((reason) => ({ field: "eligibility", message: reason }));
    throw error;
  }

  try {
    const application = await Application.create({
      student: studentProfile._id,
      drive: drive._id,
    });
    return application;
  } catch (error) {
    // The unique compound index on (student, drive) is the real guard
    // against duplicates; this just turns MongoDB's raw error into a
    // clear message instead of a generic 500. See error.middleware.js
    // for the same translation as a fallback safety net.
    if (error.code === 11000) {
      throw new AppError("You have already applied to this drive", 409);
    }
    throw error;
  }
}

/**
 * Lists a student's own applications, with the drive details populated
 * so the frontend can show company/role/status without a second request.
 */
async function listApplicationsForStudent(userId) {
  const studentProfile = await getProfileOrThrow(userId);
  const applications = await Application.find({ student: studentProfile._id })
    .populate("drive", "companyName jobRole location ctc deadline driveDate status")
    .sort({ createdAt: -1 });
  return applications;
}

/**
 * Fetches a single application, but only if it belongs to the requesting
 * student — prevents a student from viewing another student's application
 * by guessing an ID.
 */
async function getApplicationForStudent(userId, applicationId) {
  const studentProfile = await getProfileOrThrow(userId);
  const application = await Application.findOne({
    _id: applicationId,
    student: studentProfile._id,
  }).populate("drive");

  if (!application) {
    throw new AppError("Application not found", 404);
  }
  return application;
}

/**
 * Checks whether a given recruiter (by User id) is assigned to a given
 * drive. This is THE access-control check for every recruiter-facing
 * function below — a recruiter who isn't in drive.recruiters must never
 * see or modify that drive's applications, regardless of what IDs they
 * guess in the URL.
 */
async function assertRecruiterAssignedToDrive(recruiterUserId, drive) {
  const isAssigned = drive.recruiters.some((id) => id.toString() === recruiterUserId.toString());
  if (!isAssigned) {
    throw new AppError("You are not assigned to this drive", 403);
  }
}

/**
 * Lists applications ("candidates") for a drive, but only if the
 * requesting recruiter is actually assigned to that drive.
 */
async function listCandidatesForDrive(recruiterUserId, driveId, { status } = {}) {
  const drive = await PlacementDrive.findById(driveId);
  if (!drive) {
    throw new AppError("Placement drive not found", 404);
  }

  await assertRecruiterAssignedToDrive(recruiterUserId, drive);

  const query = { drive: driveId };
  if (status) {
    query.status = status;
  }

  const applications = await Application.find(query)
    .populate({
      path: "student",
      populate: { path: "user", select: "name email" },
    })
    .sort({ createdAt: -1 });

  return { drive, applications };
}

/**
 * Updates an application's status, enforcing three things in order:
 * 1. The requesting recruiter is assigned to the application's drive
 *    (via the drive's `recruiters` array — never trust a URL param
 *    alone for this).
 * 2. Recruiters cannot set WITHDRAWN — that's a student-initiated
 *    action representing the student's own choice, not something a
 *    recruiter does on their behalf.
 * 3. The requested transition is actually allowed from the
 *    application's current status, per ALLOWED_TRANSITIONS.
 */
async function updateApplicationStatus(recruiterUserId, applicationId, { status, recruiterNotes }) {
  const application = await Application.findById(applicationId).populate("drive");
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  await assertRecruiterAssignedToDrive(recruiterUserId, application.drive);

  if (status !== undefined) {
    if (status === "WITHDRAWN") {
      throw new AppError("Recruiters cannot withdraw an application on behalf of a student", 400);
    }

    const allowedNextStatuses = ALLOWED_TRANSITIONS[application.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      throw new AppError(
        `Cannot move an application from ${application.status} to ${status}`,
        400
      );
    }

    application.status = status;
  }

  if (recruiterNotes !== undefined) {
    application.recruiterNotes = recruiterNotes;
  }

  await application.save();
  return application;
}

/**
 * Lets a student withdraw their own application, if the transition is
 * currently allowed (i.e. the application hasn't already reached a
 * terminal state like OFFERED/REJECTED/WITHDRAWN). Reuses the exact
 * same ALLOWED_TRANSITIONS map recruiters are checked against — a
 * withdrawal is just another transition, evaluated by the same rules,
 * not a separate concept.
 *
 * Ownership is enforced the same way as getApplicationForStudent:
 * the query itself is scoped to `student: studentProfile._id`, so a
 * student can never withdraw someone else's application by guessing
 * an ID.
 */
async function withdrawApplication(userId, applicationId) {
  const studentProfile = await getProfileOrThrow(userId);

  const application = await Application.findOne({
    _id: applicationId,
    student: studentProfile._id,
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[application.status] || [];
  if (!allowedNextStatuses.includes("WITHDRAWN")) {
    throw new AppError(
      `This application cannot be withdrawn because it is already ${application.status.toLowerCase()}`,
      400
    );
  }

  application.status = "WITHDRAWN";
  await application.save();
  return application;
}

export const applicationService = {
  applyToDrive,
  listApplicationsForStudent,
  getApplicationForStudent,
  getProfileOrThrow,
  listCandidatesForDrive,
  updateApplicationStatus,
  withdrawApplication,
};