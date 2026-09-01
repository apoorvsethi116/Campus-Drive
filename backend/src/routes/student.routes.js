import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { updateProfileValidator } from "../validators/student.validator.js";
import {
  getProfile,
  updateProfile,
  listDrives,
  getDriveDetails,
} from "../controllers/student/student.controller.js";
import {
  applyToDrive,
  listApplications,
  getApplication,
  withdrawApplication,
} from "../controllers/student/application.controller.js";

const router = Router();

// Every route below requires a logged-in user with the STUDENT role.
router.use(authenticate, authorizeRoles("STUDENT"));

router.get("/profile", getProfile);
router.patch("/profile", validate(updateProfileValidator), updateProfile);

router.get("/drives", listDrives);
router.get("/drives/:driveId", getDriveDetails);
router.post("/drives/:driveId/apply", applyToDrive);

router.get("/applications", listApplications);
router.get("/applications/:id", getApplication);
router.patch("/applications/:id/withdraw", withdrawApplication);

export default router;
