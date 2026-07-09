import express, { Router } from "express";

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

const router = Router();
const fileUploadLimit = process.env.FILE_UPLOAD_LIMIT || "50mb";

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
router.post(
  "/:projectId/files",
  requireAuth,
  requirePermissions("projects.files.upload"),
  express.raw({
    limit: fileUploadLimit,
    type: "*/*",
  }),
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
