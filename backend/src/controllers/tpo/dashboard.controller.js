import { StudentProfile } from "../../models/StudentProfile.model.js";
import { PlacementDrive } from "../../models/PlacementDrive.model.js";
import { Application } from "../../models/Application.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";

/**
 * Aggregates the handful of counts the TPO dashboard needs. Kept as
 * plain Promise.all'd counts rather than a single complex aggregation
 * pipeline — the numbers involved are small (one college's data) and
 * this stays readable and explainable, which matters more here than
 * shaving a few queries into one pipeline.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalStudents, activeDrives, totalApplications, totalOffers, distinctOfferedStudents] =
    await Promise.all([
      StudentProfile.countDocuments(),
      PlacementDrive.countDocuments({ status: "OPEN" }),
      Application.countDocuments(),
      Application.countDocuments({ status: "OFFERED" }),
      Application.distinct("student", { status: "OFFERED" }),
    ]);

  const placementPercentage =
    totalStudents > 0 ? Number(((distinctOfferedStudents.length / totalStudents) * 100).toFixed(2)) : 0;

  sendSuccess(res, {
    message: "Dashboard statistics fetched successfully",
    data: {
      totalStudents,
      activeDrives,
      totalApplications,
      totalOffers,
      placedStudents: distinctOfferedStudents.length,
      placementPercentage,
    },
  });
});
