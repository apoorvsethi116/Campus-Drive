import { Router } from "express";
import authRoutes from "./auth.routes.js";
import studentRoutes from "./student.routes.js";
import tpoRoutes from "./tpo.routes.js";
import recruiterRoutes from "./recruiter.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/tpo", tpoRoutes);
router.use("/recruiter", recruiterRoutes);

export default router;
