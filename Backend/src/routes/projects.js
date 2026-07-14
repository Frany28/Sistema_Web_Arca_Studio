import { Router } from "express";

import {
  getProjectDetail,
  getMyProjects,
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
  streamProjectCommentEvents,
} from "../controllers/projectCommentController.js";
import { requireAuth, requirePermissions } from "../middlewares/auth.js";
import { commentRateLimit, uploadRateLimit } from "../middlewares/actionRateLimits.js";

const router = Router();

router.get("/", requireAuth, requirePermissions("projects.read"), getMyProjects);
router.get(
  "/:projectId",
  requireAuth,
  requirePermissions("projects.read"),
  getProjectDetail,
);
router.get("/:projectId/comments", requireAuth, getProjectComments);
router.get("/:projectId/events", requireAuth, streamProjectCommentEvents);
router.post("/:projectId/comments", requireAuth, commentRateLimit, createProjectComment);
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
