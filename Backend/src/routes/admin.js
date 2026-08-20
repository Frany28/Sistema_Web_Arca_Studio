import { Router } from "express";

import {
  getAdminAssignees,
  getDashboardMetrics,
  getDashboardOverview,
  updateProjectAssignees,
  updateProjectRequestAssignees,
  streamAdminAssigneeProfilePhoto,
} from "../controllers/adminDashboardController.js";
import {
  getPermissions,
  getRolePermissionMatrix,
  getRolePermissions,
  getRoles,
  updateRolePermissions,
} from "../controllers/rolePermissionController.js";
import { getAdminUsers, patchAdminUserStatus, postAdminUser } from "../controllers/adminUserController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { createRateLimit } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import {
  adminAssigneePhotoSchema,
  projectAssigneesSchema,
  projectRequestAssigneesSchema,
} from "../validation/adminDashboardSchemas.js";
import {
  adminUserCreateSchema,
  adminUserListSchema,
  adminUserStatusSchema,
} from "../validation/adminUserSchemas.js";

const router = Router();
const adminUserCreateRateLimit = createRateLimit({
  name: "admin-user-create",
  max: 20,
  windowMs: 60 * 60 * 1000,
});
const adminUserStatusRateLimit = createRateLimit({
  name: "admin-user-status",
  max: 60,
  windowMs: 60 * 60 * 1000,
});

router.use(requireAuth, requireRoles("admin"));

router.get("/dashboard-metrics", getDashboardMetrics);
router.get("/dashboard-overview", getDashboardOverview);
router.get("/assignees", getAdminAssignees);
router.get("/users", validate(adminUserListSchema), getAdminUsers);
router.post(
  "/users",
  adminUserCreateRateLimit,
  validate(adminUserCreateSchema),
  postAdminUser,
);
router.patch(
  "/users/:userId/status",
  adminUserStatusRateLimit,
  validate(adminUserStatusSchema),
  patchAdminUserStatus,
);
router.get(
  "/assignees/:userId/profile-photo",
  validate(adminAssigneePhotoSchema),
  streamAdminAssigneeProfilePhoto,
);
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
