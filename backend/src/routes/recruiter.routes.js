import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { updateApplicationStatusValidator } from "../validators/application.validator.js";
import { listMyDrives, getDashboardStats } from "../controllers/recruiter/recruiter.controller.js";
import {
  listCandidates,
  updateApplicationStatus,
} from "../controllers/recruiter/candidate.controller.js";

const router = Router();

// Every route below requires a logged-in user with the RECRUITER role.
router.use(authenticate, authorizeRoles("RECRUITER"));

router.get("/dashboard", getDashboardStats);
router.get("/drives", listMyDrives);
router.get("/drives/:driveId/candidates", listCandidates);
router.patch("/applications/:id/status", validate(updateApplicationStatusValidator), updateApplicationStatus);

export default router;
