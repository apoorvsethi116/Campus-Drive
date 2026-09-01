import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { createDriveValidator, updateDriveValidator } from "../validators/drive.validator.js";
import {
  createDrive,
  listDrives,
  getDrive,
  updateDrive,
  deleteDrive,
  getEligibleStudents,
  getDriveApplicants,
  listRecruiters,
} from "../controllers/tpo/drive.controller.js";
import { listStudents, getStudentById } from "../controllers/tpo/student.controller.js";
import { getDashboardStats } from "../controllers/tpo/dashboard.controller.js";

const router = Router();

// Every route below requires a logged-in user with the TPO role.
router.use(authenticate, authorizeRoles("TPO"));

router.get("/dashboard", getDashboardStats);

router.get("/recruiters", listRecruiters);

router.post("/drives", validate(createDriveValidator), createDrive);
router.get("/drives", listDrives);
router.get("/drives/:id", getDrive);
router.patch("/drives/:id", validate(updateDriveValidator), updateDrive);
router.delete("/drives/:id", deleteDrive);
router.get("/drives/:id/eligible-students", getEligibleStudents);
router.get("/drives/:id/applicants", getDriveApplicants);

router.get("/students", listStudents);
router.get("/students/:id", getStudentById);

export default router;