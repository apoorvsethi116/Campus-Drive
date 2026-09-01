import { applicationService } from "../../services/application/application.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";

export const applyToDrive = asyncHandler(async (req, res) => {
  const application = await applicationService.applyToDrive(req.user._id, req.params.driveId);
  sendSuccess(res, {
    statusCode: 201,
    message: "Application submitted successfully",
    data: { application },
  });
});

export const listApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.listApplicationsForStudent(req.user._id);
  sendSuccess(res, {
    message: "Applications fetched successfully",
    data: { applications, count: applications.length },
  });
});

export const getApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationForStudent(req.user._id, req.params.id);
  sendSuccess(res, {
    message: "Application fetched successfully",
    data: { application },
  });
});

export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.withdrawApplication(req.user._id, req.params.id);
  sendSuccess(res, {
    message: "Application withdrawn successfully",
    data: { application },
  });
});
