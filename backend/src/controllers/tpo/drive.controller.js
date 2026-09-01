import { PlacementDrive } from "../../models/PlacementDrive.model.js";
import { StudentProfile } from "../../models/StudentProfile.model.js";
import { Application } from "../../models/Application.model.js";
import { User } from "../../models/User.model.js";
import { checkEligibility } from "../../services/eligibility/eligibility.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";

const DRIVE_FIELDS = [
  "companyName",
  "jobRole",
  "description",
  "location",
  "employmentType",
  "ctc",
  "eligibilityCriteria",
  "deadline",
  "driveDate",
  "recruiters",
  "status",
];

/**
 * Validates that every id in `recruiterIds` actually belongs to an
 * existing user with role RECRUITER. Prevents a TPO from accidentally
 * (or deliberately) assigning a student or another TPO as a "recruiter"
 * on a drive, which would silently break recruiter-scoped access checks
 * later (Phase 5).
 */
async function assertValidRecruiterIds(recruiterIds) {
  if (!recruiterIds || recruiterIds.length === 0) return;

  const recruiters = await User.find({ _id: { $in: recruiterIds }, role: "RECRUITER" });
  if (recruiters.length !== recruiterIds.length) {
    throw new AppError("One or more recruiter IDs are invalid or do not belong to a recruiter account", 400);
  }
}

export const createDrive = asyncHandler(async (req, res) => {
  await assertValidRecruiterIds(req.body.recruiters);

  const drive = await PlacementDrive.create({
    companyName: req.body.companyName,
    jobRole: req.body.jobRole,
    description: req.body.description,
    location: req.body.location,
    employmentType: req.body.employmentType,
    ctc: req.body.ctc,
    eligibilityCriteria: req.body.eligibilityCriteria,
    deadline: req.body.deadline,
    driveDate: req.body.driveDate,
    recruiters: req.body.recruiters || [],
    status: req.body.status || "DRAFT",
    postedBy: req.user._id,
  });

  sendSuccess(res, { statusCode: 201, message: "Placement drive created successfully", data: { drive } });
});

/**
 * Lists all drives (the TPO office is treated as a single shared admin
 * view, not siloed per TPO user — matching how most college placement
 * cells actually work: one team, one drive list). Supports optional
 * status filtering and company/role search.
 */
export const listDrives = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [{ companyName: searchRegex }, { jobRole: searchRegex }];
  }

  const drives = await PlacementDrive.find(query)
    .populate("postedBy", "name email")
    .populate("recruiters", "name email")
    .sort({ createdAt: -1 });

  sendSuccess(res, { message: "Drives fetched successfully", data: { drives, count: drives.length } });
});

export const getDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id)
    .populate("postedBy", "name email")
    .populate("recruiters", "name email");

  if (!drive) {
    throw new AppError("Placement drive not found", 404);
  }

  sendSuccess(res, { message: "Drive fetched successfully", data: { drive } });
});

export const updateDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id);
  if (!drive) {
    throw new AppError("Placement drive not found", 404);
  }

  if (req.body.recruiters !== undefined) {
    await assertValidRecruiterIds(req.body.recruiters);
  }

  for (const field of DRIVE_FIELDS) {
    if (req.body[field] !== undefined) {
      drive[field] = req.body[field];
    }
  }

  await drive.save();
  sendSuccess(res, { message: "Drive updated successfully", data: { drive } });
});

/**
 * Deletes a drive, but only if no applications reference it. Deleting a
 * drive out from under existing applications would leave orphaned
 * Application documents pointing at a drive that no longer exists — a
 * data integrity problem, not just a UX one. TPOs who want to stop a
 * drive that already has applicants should close it (status: CLOSED)
 * instead of deleting it.
 */
export const deleteDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id);
  if (!drive) {
    throw new AppError("Placement drive not found", 404);
  }

  const hasApplications = await Application.exists({ drive: drive._id });
  if (hasApplications) {
    throw new AppError(
      "This drive has existing applications and cannot be deleted. Close it instead to stop accepting new applications.",
      409
    );
  }

  await PlacementDrive.findByIdAndDelete(drive._id);
  sendSuccess(res, { message: "Drive deleted successfully" });
});

/**
 * Lists recruiter accounts so a TPO can pick real recruiters when
 * assigning them to a drive (see assertValidRecruiterIds above, which
 * validates the IDs this endpoint helps the TPO discover in the first
 * place). Read-only, TPO-only, and deliberately returns only the three
 * fields a picker UI needs - never the recruiter's password or any
 * other User field.
 */
export const listRecruiters = asyncHandler(async (req, res) => {
  const recruiters = await User.find({ role: "RECRUITER" }, "_id name email").sort({ name: 1 });
  sendSuccess(res, { message: "Recruiters fetched successfully", data: { recruiters } });
});

/**
 * Reuses the same checkEligibility function the student-facing endpoints
 * use (see eligibility.service.js) so a TPO's view of "who is eligible"
 * can never drift from what a student sees when browsing drives.
 */
export const getEligibleStudents = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id);
  if (!drive) {
    throw new AppError("Placement drive not found", 404);
  }

  const profiles = await StudentProfile.find().populate("user", "name email");

  const eligible = [];
  const ineligible = [];

  for (const profile of profiles) {
    const { eligible: isEligible, reasons } = checkEligibility(profile, drive.eligibilityCriteria);
    const entry = { profile, reasons };
    if (isEligible) {
      eligible.push(entry);
    } else {
      ineligible.push(entry);
    }
  }

  sendSuccess(res, {
    message: "Eligible students fetched successfully",
    data: {
      driveId: drive._id,
      eligibleCount: eligible.length,
      ineligibleCount: ineligible.length,
      eligible,
      ineligible,
    },
  });
});

/**
 * Lists every application submitted to a drive, regardless of status -
 * reuses the existing Application relationship (student + drive) rather
 * than creating any new data. Populates the same student->user shape
 * already used by the recruiter's candidate view, so the same table
 * pattern can be reused on the frontend.
 */
export const getDriveApplicants = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id);
  if (!drive) {
    throw new AppError("Placement drive not found", 404);
  }

  const applications = await Application.find({ drive: drive._id })
    .populate({
      path: "student",
      populate: { path: "user", select: "name email" },
    })
    .sort({ createdAt: -1 });

  sendSuccess(res, {
    message: "Applicants fetched successfully",
    data: { drive, applications, count: applications.length },
  });
});