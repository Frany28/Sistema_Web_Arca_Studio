import { Router } from "express";

import {
  createEnvironmentComment,
  listEnvironmentComments,
  streamEnvironmentCommentAuthorProfilePhoto,
} from "../controllers/environmentCommentController.js";
import { commentRateLimit } from "../middlewares/actionRateLimits.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  environmentCommentAuthorPhotoSchema,
  environmentCommentSchema,
  paginationSchema,
} from "../validation/schemas.js";

const router = Router();

router.get("/", requireAuth, validate(paginationSchema), listEnvironmentComments);
router.get(
  "/authors/:userId/profile-photo",
  requireAuth,
  validate(environmentCommentAuthorPhotoSchema),
  streamEnvironmentCommentAuthorProfilePhoto,
);
router.post(
  "/",
  requireAuth,
  commentRateLimit,
  validate(environmentCommentSchema),
  createEnvironmentComment,
);

export default router;
