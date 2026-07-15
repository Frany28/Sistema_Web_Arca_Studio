import { Router } from "express";

import {
  getProjectDetail,
  getMyProjects,
  streamAssignedArchitectProfilePhoto,
  updateProjectPublication,
} from "../controllers/projectController.js";
import {
  deleteProjectAttachment,
  streamProjectFile,
  uploadProjectAttachment,
} from "../controllers/fileController.js";
import {
  createProjectComment,
  getProjectComments,
  streamProjectCommentAuthorProfilePhoto,
  streamProjectCommentEvents,
} from "../controllers/projectCommentController.js";
import { requireAuth, requirePermissions } from "../middlewares/auth.js";
import { commentRateLimit, uploadRateLimit } from "../middlewares/actionRateLimits.js";
import { validate } from "../middlewares/validate.js";
import {
  commentSchema,
  paginationSchema,
  projectCommentAuthorPhotoSchema,
  projectIdSchema,
} from "../validation/schemas.js";

const router = Router();

router.get("/", requireAuth, requirePermissions("projects.read"), validate(paginationSchema), getMyProjects);
router.get(
  "/:projectId/assigned-architect/profile-photo",
  requireAuth,
  validate(projectIdSchema),
  streamAssignedArchitectProfilePhoto,
);
router.get(
  "/:projectId",
  requireAuth,
  requirePermissions("projects.read"),
  getProjectDetail,
);
router.get("/:projectId/comments", requireAuth, validate(paginationSchema), getProjectComments);
router.get(
  "/:projectId/comment-authors/:userId/profile-photo",
  requireAuth,
  validate(projectCommentAuthorPhotoSchema),
  streamProjectCommentAuthorProfilePhoto,
);
router.get("/:projectId/events", requireAuth, streamProjectCommentEvents);
router.post("/:projectId/comments", requireAuth, commentRateLimit, validate(commentSchema), createProjectComment);
router.post(
  "/:projectId/files",
  requireAuth,
  requirePermissions("projects.files.upload"),
  uploadRateLimit,
  uploadProjectAttachment,
);
router.delete(
  "/:projectId/files/:fileId",
  requireAuth,
  requirePermissions("projects.files.delete"),
  deleteProjectAttachment,
);
router.get(
  "/:projectId/files/:fileId/content",
  requireAuth,
  requirePermissions("projects.read"),
  streamProjectFile,
);
router.patch(
  "/:projectId/publication",
  requireAuth,
  requirePermissions("projects.publish"),
  updateProjectPublication,
);

export default router;
