import { Router } from "express";

import {
  changePassword,
  forgotPassword,
  getProfilePhotoImage,
  login,
  logout,
  me,
  resetPassword,
  uploadProfilePhoto,
  verifyResetToken,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { loginRateLimit } from "../middlewares/loginRateLimit.js";

const router = Router();

router.post("/login", loginRateLimit, login);
router.post("/forgot-password", loginRateLimit, forgotPassword);
router.post("/verify-reset-token", loginRateLimit, verifyResetToken);
router.post("/reset-password", loginRateLimit, resetPassword);
router.post("/change-password", requireAuth, loginRateLimit, changePassword);
router.get("/profile-photo/image", requireAuth, getProfilePhotoImage);
router.post(
  "/profile-photo",
  requireAuth,
  uploadProfilePhoto,
);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;
