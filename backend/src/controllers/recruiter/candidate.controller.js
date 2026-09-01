import { applicationService } from "../../services/application/application.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";

export const listCandidates = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { drive, applications } = await applicationService.listCandidatesForDrive(
    req.user._id,
    req.params.driveId,
    { status }
  );

  sendSuccess(res, {
    message: "Candidates fetched successfully",
    data: { drive, applications, count: applications.length },
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, recruiterNotes } = req.body;

  if (status === undefined && recruiterNotes === undefined) {
    throw new AppError("Provide a status, recruiterNotes, or both to update", 400);
  }

  const application = await applicationService.updateApplicationStatus(req.user._id, req.params.id, {
    status,
    recruiterNotes,
  });

  sendSuccess(res, {
    message: "Application updated successfully",
    data: { application },
  });
});
