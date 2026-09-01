import { PlacementDrive } from "../../models/PlacementDrive.model.js";
import { Application } from "../../models/Application.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";

/**
 * Lists only the drives this recruiter is actually assigned to.
 * The query itself is the access-control boundary: a recruiter simply
 * never receives a drive they aren't in `recruiters` for, rather than
 * fetching everything and filtering afterward.
 */
export const listMyDrives = asyncHandler(async (req, res) => {
  const drives = await PlacementDrive.find({ recruiters: req.user._id })
    .populate("postedBy", "name email")
    .sort({ createdAt: -1 });

  sendSuccess(res, { message: "Drives fetched successfully", data: { drives, count: drives.length } });
});

/**
 * Aggregates dashboard counts scoped to this recruiter's assigned
 * drives only — never global platform numbers, which would leak
 * information about drives/candidates outside this recruiter's scope.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const assignedDriveIds = await PlacementDrive.find({ recruiters: req.user._id }).distinct("_id");

  const [activeDrives, totalCandidates, shortlisted, interviews, offers] = await Promise.all([
    PlacementDrive.countDocuments({ recruiters: req.user._id, status: "OPEN" }),
    Application.countDocuments({ drive: { $in: assignedDriveIds } }),
    Application.countDocuments({ drive: { $in: assignedDriveIds }, status: "SHORTLISTED" }),
    Application.countDocuments({ drive: { $in: assignedDriveIds }, status: "INTERVIEW" }),
    Application.countDocuments({ drive: { $in: assignedDriveIds }, status: "OFFERED" }),
  ]);

  sendSuccess(res, {
    message: "Dashboard statistics fetched successfully",
    data: {
      activeDrives,
      totalCandidates,
      shortlisted,
      interviews,
      offers,
    },
  });
});
