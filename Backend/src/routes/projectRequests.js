import { Router } from "express";

import {
  createProjectRequest,
  listProjectRequests,
  updateProjectRequest,
} from "../controllers/projectRequestController.js";
import {
  deleteProjectRequestAttachment,
  uploadProjectRequestAttachment,
} from "../controllers/fileController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { requestRateLimit, uploadRateLimit } from "../middlewares/actionRateLimits.js";
import { paginationSchema } from "../validation/schemas.js";

const router = Router();

router.get("/", requireAuth, validate(paginationSchema), listProjectRequests);
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
