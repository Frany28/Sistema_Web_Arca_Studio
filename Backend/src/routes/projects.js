import { Router } from "express";

import {
  getProjectDetail,
  getMyProjects,
  streamAssignedArchitectProfilePhoto,
  updateProjectPublication,
} from "../controllers/projectController.js";
import {
  getModelRenderSettings,
  updateModelRenderSettings,
} from "../controllers/modelRenderSettingsController.js";
import {
  deleteProjectAttachment,
  streamProjectFile,
  uploadProjectAttachment,
} from "../controllers/fileController.js";
import {
  createProjectComment,
  getProjectComments,
  getProjectDocumentComments,
  streamProjectCommentAuthorProfilePhoto,
  streamProjectCommentEvents,
} from "../controllers/projectCommentController.js";
import { requireAuth, requirePermissions } from "../middlewares/auth.js";
import { commentRateLimit, modelSettingsRateLimit, uploadRateLimit } from "../middlewares/actionRateLimits.js";
import { validate } from "../middlewares/validate.js";
import {
  commentSchema,
  documentCommentsSchema,
  paginationSchema,
  projectDetailSchema,
  projectCommentAuthorPhotoSchema,
  projectIdSchema,
  modelRenderSettingsParamsSchema,
  updateModelRenderSettingsSchema,
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
  validate(projectDetailSchema),
  getProjectDetail,
);
router.get("/:projectId/comments", requireAuth, validate(paginationSchema), getProjectComments);
router.get(
  "/:projectId/files/:fileId/comments",
  requireAuth,
  validate(documentCommentsSchema),
  getProjectDocumentComments,
);
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
router.get(
  "/:projectId/files/:fileId/render-settings",
  requireAuth,
  requirePermissions("projects.read"),
  validate(modelRenderSettingsParamsSchema),
  getModelRenderSettings,
);
router.put(
  "/:projectId/files/:fileId/render-settings",
  requireAuth,
  requirePermissions("projects.files.upload"),
  modelSettingsRateLimit,
  validate(updateModelRenderSettingsSchema),
  updateModelRenderSettings,
);
router.patch(
  "/:projectId/publication",
  requireAuth,
  requirePermissions("projects.publish"),
  updateProjectPublication,
);

export default router;
