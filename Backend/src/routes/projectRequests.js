import { Router } from "express";

import { createProjectRequest } from "../controllers/projectRequestController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/", requireAuth, createProjectRequest);

export default router;
