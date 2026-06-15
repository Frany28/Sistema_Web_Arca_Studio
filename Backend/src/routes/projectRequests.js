import express, { Router } from "express";

import {
  createProjectRequest,
  updateProjectRequest,
} from "../controllers/projectRequestController.js";
import {
  deleteProjectRequestAttachment,
  uploadProjectRequestAttachment,
} from "../controllers/fileController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const fileUploadLimit = process.env.FILE_UPLOAD_LIMIT || "50mb";

router.post("/", requireAuth, createProjectRequest);
router.patch("/:projectRequestId", requireAuth, updateProjectRequest);
router.post(
  "/:projectRequestId/files",
  requireAuth,
  express.raw({
    limit: fileUploadLimit,
    type: "*/*",
  }),
  uploadProjectRequestAttachment,
);
router.delete(
  "/:projectRequestId/files/:fileId",
  requireAuth,
  deleteProjectRequestAttachment,
);

export default router;
