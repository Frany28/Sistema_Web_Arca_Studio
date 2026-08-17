import { Router } from "express";

import {
  getAdminAssignees,
  getDashboardMetrics,
  getDashboardOverview,
  updateProjectAssignees,
  updateProjectRequestAssignees,
} from "../controllers/adminDashboardController.js";
import {
  getPermissions,
  getRolePermissionMatrix,
  getRolePermissions,
  getRoles,
  updateRolePermissions,
} from "../controllers/rolePermissionController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  projectAssigneesSchema,
  projectRequestAssigneesSchema,
} from "../validation/adminDashboardSchemas.js";

const router = Router();

router.use(requireAuth, requireRoles("admin"));

router.get("/dashboard-metrics", getDashboardMetrics);
router.get("/dashboard-overview", getDashboardOverview);
router.get("/assignees", getAdminAssignees);
router.put(
  "/projects/:projectId/assignees",
  validate(projectAssigneesSchema),
  updateProjectAssignees,
);
router.put(
  "/project-requests/:projectRequestId/assignees",
  validate(projectRequestAssigneesSchema),
  updateProjectRequestAssignees,
);
router.get("/roles", getRoles);
router.get("/permissions", getPermissions);
router.get("/roles-permissions", getRolePermissionMatrix);
router.get("/roles/:roleCode/permissions", getRolePermissions);
router.put("/roles/:roleCode/permissions", updateRolePermissions);

export default router;
