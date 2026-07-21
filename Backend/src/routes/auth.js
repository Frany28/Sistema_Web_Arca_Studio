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
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../validation/schemas.js";
import {
  completeRegistrationSchema,
  resendRegistrationSchema,
  startRegistrationSchema,
  verifyRegistrationSchema,
} from "../validation/registrationSchemas.js";
import {
  completeRegistration,
  resendRegistration,
  startRegistration,
  verifyRegistration,
} from "../controllers/registrationController.js";

const router = Router();

router.post("/login", loginRateLimit, validate(loginSchema), login);
router.post("/registration/start", loginRateLimit, validate(startRegistrationSchema), startRegistration);
router.post("/registration/resend", loginRateLimit, validate(resendRegistrationSchema), resendRegistration);
router.post("/registration/verify", loginRateLimit, validate(verifyRegistrationSchema), verifyRegistration);
router.post("/registration/complete", loginRateLimit, validate(completeRegistrationSchema), completeRegistration);
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
