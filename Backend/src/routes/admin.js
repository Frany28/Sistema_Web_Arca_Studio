import { Router } from "express";

import { getDashboardMetrics } from "../controllers/adminDashboardController.js";
import {
  getPermissions,
  getRolePermissionMatrix,
  getRolePermissions,
  getRoles,
  updateRolePermissions,
} from "../controllers/rolePermissionController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth, requireRoles("admin"));

router.get("/dashboard-metrics", getDashboardMetrics);
router.get("/roles", getRoles);
router.get("/permissions", getPermissions);
router.get("/roles-permissions", getRolePermissionMatrix);
router.get("/roles/:roleCode/permissions", getRolePermissions);
router.put("/roles/:roleCode/permissions", updateRolePermissions);

export default router;
