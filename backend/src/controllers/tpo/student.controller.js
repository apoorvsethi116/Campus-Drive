import { StudentProfile } from "../../models/StudentProfile.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Lists students with optional search/filter, for the TPO's student
 * management view. Filtering happens server-side (query params ->
 * Mongo query) rather than fetching everything and filtering in JS,
 * per §27 of the spec — this is also exactly what the
 * branch+currentCGPA+activeBacklogs compound index (Phase 1) exists to
 * make fast.
 *
 * Query params:
 *   search      - matches against the linked user's name or email
 *   branch      - exact branch match
 *   minCGPA     - currentCGPA >= minCGPA
 *   maxBacklogs - activeBacklogs <= maxBacklogs
 */
export const listStudents = asyncHandler(async (req, res) => {
  const { search, branch, minCGPA, maxBacklogs } = req.query;

  const query = {};

  if (branch) {
    query.branch = branch;
  }

  if (minCGPA !== undefined) {
    const parsed = Number(minCGPA);
    if (Number.isNaN(parsed)) {
      throw new AppError("minCGPA must be a number", 400);
    }
    query.currentCGPA = { ...query.currentCGPA, $gte: parsed };
  }

  if (maxBacklogs !== undefined) {
    const parsed = Number(maxBacklogs);
    if (Number.isNaN(parsed)) {
      throw new AppError("maxBacklogs must be a number", 400);
    }
    query.activeBacklogs = { ...query.activeBacklogs, $lte: parsed };
  }

  const profiles = await StudentProfile.find(query)
    .populate("user", "name email isActive")
    .sort({ branch: 1, currentCGPA: -1 });

  // Name/email search happens after population since those fields live
  // on the referenced User document, not on StudentProfile itself.
  // Kept simple (in-memory filter on an already-narrowed result set)
  // rather than a $lookup aggregation, since this is a small dataset
  // for a single college's placement cell, not a multi-tenant search
  // index — an aggregation pipeline here would be complexity without a
  // concrete performance need.
  let results = profiles;
  if (search) {
    const searchLower = search.toLowerCase();
    results = profiles.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(searchLower) ||
        p.user?.email?.toLowerCase().includes(searchLower)
    );
  }

  sendSuccess(res, {
    message: "Students fetched successfully",
    data: { students: results, count: results.length },
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id).populate("user", "name email isActive");
  if (!profile) {
    throw new AppError("Student not found", 404);
  }
  sendSuccess(res, { message: "Student fetched successfully", data: { profile } });
});
