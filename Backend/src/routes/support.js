import express, { Router } from "express";

import {
  createSupportRequest,
  uploadSupportRequestAttachment,
} from "../controllers/supportController.js";
import { requireAuth, requirePermissions } from "../middlewares/auth.js";

const router = Router();
const fileUploadLimit = process.env.FILE_UPLOAD_LIMIT || "50mb";

router.post(
  "/requests",
  requireAuth,
  requirePermissions("support.requests.create"),
  createSupportRequest,
);
router.post(
  "/requests/:supportRequestId/files",
  requireAuth,
  requirePermissions("support.files.upload"),
  express.raw({
    limit: fileUploadLimit,
    type: "*/*",
  }),
  uploadSupportRequestAttachment,
);

export default router;
