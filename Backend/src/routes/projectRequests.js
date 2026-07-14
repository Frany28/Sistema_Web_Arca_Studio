import { Router } from "express";

import {
  createProjectRequest,
  updateProjectRequest,
} from "../controllers/projectRequestController.js";
import {
  deleteProjectRequestAttachment,
  uploadProjectRequestAttachment,
} from "../controllers/fileController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requestRateLimit, uploadRateLimit } from "../middlewares/actionRateLimits.js";

const router = Router();

router.post("/", requireAuth, requestRateLimit, createProjectRequest);
router.patch("/:projectRequestId", requireAuth, requestRateLimit, updateProjectRequest);
router.post(
  "/:projectRequestId/files",
  requireAuth,
  uploadRateLimit,
  uploadProjectRequestAttachment,
);
router.delete(
  "/:projectRequestId/files/:fileId",
  requireAuth,
  deleteProjectRequestAttachment,
);

export default router;
