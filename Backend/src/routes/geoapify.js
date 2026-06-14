import { Router } from "express";

import { getAddressSuggestions } from "../controllers/geoapifyController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/address-suggestions", requireAuth, getAddressSuggestions);

export default router;
