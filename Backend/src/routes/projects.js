import { Router } from "express";

import {
  getMyProjects,
  updateProjectPublication,
} from "../controllers/projectController.js";
import {
  createProjectComment,
  getProjectComments,
} from "../controllers/projectCommentController.js";
import { requireAuth, requirePermissions } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, requirePermissions("projects.read"), getMyProjects);
router.get("/:projectId/comments", requireAuth, getProjectComments);
router.post("/:projectId/comments", requireAuth, createProjectComment);
router.patch(
  "/:projectId/publication",
  requireAuth,
  requirePermissions("projects.publish"),
  updateProjectPublication,
);

export default router;
