import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerValidator), register);
router.post("/login", validate(loginValidator), login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;
