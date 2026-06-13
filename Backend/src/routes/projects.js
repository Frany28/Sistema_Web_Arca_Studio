import { Router } from "express";

import {
  getMyProjects,
  updateProjectPublication,
} from "../controllers/projectController.js";
import { requireAuth, requirePermissions } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, requirePermissions("projects.read"), getMyProjects);
router.patch(
  "/:projectId/publication",
  requireAuth,
  requirePermissions("projects.publish"),
  updateProjectPublication,
);

export default router;
