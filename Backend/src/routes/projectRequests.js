import express, { Router } from "express";

import { createProjectRequest } from "../controllers/projectRequestController.js";
import { uploadProjectRequestAttachment } from "../controllers/fileController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const fileUploadLimit = process.env.FILE_UPLOAD_LIMIT || "25mb";

router.post("/", requireAuth, createProjectRequest);
router.post(
  "/:projectRequestId/files",
  requireAuth,
  express.raw({
    limit: fileUploadLimit,
    type: "*/*",
  }),
  uploadProjectRequestAttachment,
);

export default router;
