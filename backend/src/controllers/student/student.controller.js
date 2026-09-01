import { StudentProfile } from "../../models/StudentProfile.model.js";
import { PlacementDrive } from "../../models/PlacementDrive.model.js";
import { checkEligibility } from "../../services/eligibility/eligibility.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";

const EDITABLE_PROFILE_FIELDS = [
  "branch",
  "currentCGPA",
  "activeBacklogs",
  "tenthPercentage",
  "twelfthPercentage",
  "phone",
  "resumeUrl",
  "skills",
  "collegeId",
];

const REQUIRED_FOR_COMPLETION = [
  "branch",
  "currentCGPA",
  "tenthPercentage",
  "twelfthPercentage",
  "graduationYear",
  "resumeUrl",
];

function computeProfileCompleted(profile) {
  return REQUIRED_FOR_COMPLETION.every((field) => {
    const value = profile[field];
    return value !== undefined && value !== null && value !== "";
  });
}

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new AppError("Student profile not found for this account", 404);
  }
  sendSuccess(res, { message: "Profile fetched successfully", data: { profile } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new AppError("Student profile not found for this account", 404);
  }

  for (const field of EDITABLE_PROFILE_FIELDS) {
    if (req.body[field] !== undefined) {
      profile[field] = req.body[field];
    }
  }

  profile.profileCompleted = computeProfileCompleted(profile);

  await profile.save();
  sendSuccess(res, { message: "Profile updated successfully", data: { profile } });
});

/**
 * Lists OPEN drives, annotated with the requesting student's eligibility
 * for each one. Supports basic search (company/role) via query params.
 * Filtering is done server-side per §27 of the spec ("prefer server-side
 * filtering for larger datasets").
 */
export const listDrives = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new AppError("Student profile not found for this account", 404);
  }

  const { search, eligibleOnly } = req.query;

  const query = { status: "OPEN" };
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [{ companyName: searchRegex }, { jobRole: searchRegex }];
  }

  const drives = await PlacementDrive.find(query).sort({ deadline: 1 });

  let annotatedDrives = drives.map((drive) => {
    const { eligible, reasons, checks } = checkEligibility(profile, drive.eligibilityCriteria);
    return {
      ...drive.toObject(),
      eligibility: { eligible, reasons, checks },
    };
  });

  if (eligibleOnly === "true") {
    annotatedDrives = annotatedDrives.filter((drive) => drive.eligibility.eligible);
  }

  sendSuccess(res, {
    message: "Drives fetched successfully",
    data: { drives: annotatedDrives, count: annotatedDrives.length },
  });
});

export const getDriveDetails = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new AppError("Student profile not found for this account", 404);
  }

  const drive = await PlacementDrive.findById(req.params.driveId);
  if (!drive) {
    throw new AppError("Placement drive not found", 404);
  }

  const { eligible, reasons, checks } = checkEligibility(profile, drive.eligibilityCriteria);

  sendSuccess(res, {
    message: "Drive details fetched successfully",
    data: {
      drive,
      eligibility: { eligible, reasons, checks },
    },
  });
});
