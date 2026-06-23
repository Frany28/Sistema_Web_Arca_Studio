import { Router } from "express";

import {
  getProjectDetail,
  getMyProjects,
  updateProjectPublication,
} from "../controllers/projectController.js";
import { streamProjectFile } from "../controllers/fileController.js";
import {
  createProjectComment,
  getProjectComments,
  streamProjectCommentEvents,
} from "../controllers/projectCommentController.js";
import { requireAuth, requirePermissions } from "../middlewares/auth.js";

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
router.post("/:projectId/comments", requireAuth, createProjectComment);
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
