import { Router } from "express";

import {
  forgotPassword,
  login,
  logout,
  me,
  resetPassword,
  verifyResetToken,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { loginRateLimit } from "../middlewares/loginRateLimit.js";

const router = Router();

router.post("/login", loginRateLimit, login);
router.post("/forgot-password", loginRateLimit, forgotPassword);
router.post("/verify-reset-token", loginRateLimit, verifyResetToken);
router.post("/reset-password", loginRateLimit, resetPassword);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;
