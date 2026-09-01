import { Router } from "express";

import {
  getAdminAssignees,
  getDashboardMetrics,
  getDashboardOverview,
  updateProjectAssignees,
  updateAdminProjects,
  updateProjectRequestAssignees,
  streamAdminAssigneeProfilePhoto,
} from "../controllers/adminDashboardController.js";
import { patchProjectRequestDecision } from "../controllers/projectRequestWorkflowController.js";
import {
  getPermissions,
  getRolePermissionMatrix,
  getRolePermissions,
  getRoles,
  updateRolePermissions,
} from "../controllers/rolePermissionController.js";
import {
  deleteAdminUserNoteById,
  getAdminUsers,
  getAdminUser,
  getAdminUserNotes,
  patchAdminUser,
  patchAdminUserNote,
  patchAdminUserStatus,
  postAdminUser,
  postAdminUserNote,
  streamAdminUserProfilePhoto,
} from "../controllers/adminUserController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { createRateLimit } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import {
  adminAssigneePhotoSchema,
  adminProjectBulkActionSchema,
  projectAssigneesSchema,
  projectRequestAssigneesSchema,
} from "../validation/adminDashboardSchemas.js";
import { projectRequestDecisionSchema } from "../validation/projectRequestWorkflowSchemas.js";
import {
  adminUserCreateSchema,
  adminUserDetailSchema,
  adminUserListSchema,
  adminUserNoteCreateSchema,
  adminUserNoteDeleteSchema,
  adminUserNoteListSchema,
  adminUserNoteUpdateSchema,
  adminUserPhotoSchema,
  adminUserStatusSchema,
  adminUserUpdateSchema,
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
const adminUserNoteRateLimit = createRateLimit({
  name: "admin-user-note",
  max: 120,
  windowMs: 60 * 60 * 1000,
});
const adminProjectBulkActionRateLimit = createRateLimit({
  name: "admin-project-bulk-action",
  max: 60,
  windowMs: 60 * 60 * 1000,
});
const adminProjectRequestDecisionRateLimit = createRateLimit({
  name: "admin-project-request-decision",
  max: 60,
  windowMs: 60 * 60 * 1000,
});

router.use(requireAuth, requireRoles("admin"));

router.get("/dashboard-metrics", getDashboardMetrics);
router.get("/dashboard-overview", getDashboardOverview);
router.get("/assignees", getAdminAssignees);
router.get("/users", validate(adminUserListSchema), getAdminUsers);
router.get("/users/:userId", validate(adminUserDetailSchema), getAdminUser);
router.get("/users/:userId/notes", validate(adminUserNoteListSchema), getAdminUserNotes);
router.post(
  "/users/:userId/notes",
  adminUserNoteRateLimit,
  validate(adminUserNoteCreateSchema),
  postAdminUserNote,
);
router.patch(
  "/users/:userId",
  adminUserStatusRateLimit,
  validate(adminUserUpdateSchema),
  patchAdminUser,
);
router.patch(
  "/users/:userId/notes/:noteId",
  adminUserNoteRateLimit,
  validate(adminUserNoteUpdateSchema),
  patchAdminUserNote,
);
router.delete(
  "/users/:userId/notes/:noteId",
  adminUserNoteRateLimit,
  validate(adminUserNoteDeleteSchema),
  deleteAdminUserNoteById,
);
router.get(
  "/users/:userId/profile-photo",
  validate(adminUserPhotoSchema),
  streamAdminUserProfilePhoto,
);
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
router.patch(
  "/projects/bulk-action",
  adminProjectBulkActionRateLimit,
  validate(adminProjectBulkActionSchema),
  updateAdminProjects,
);
router.put(
  "/project-requests/:projectRequestId/assignees",
  validate(projectRequestAssigneesSchema),
  updateProjectRequestAssignees,
);
router.patch(
  "/project-requests/:projectRequestId/decision",
  adminProjectRequestDecisionRateLimit,
  validate(projectRequestDecisionSchema),
  patchProjectRequestDecision,
);
router.get("/roles", getRoles);
router.get("/permissions", getPermissions);
router.get("/roles-permissions", getRolePermissionMatrix);
router.get("/roles/:roleCode/permissions", getRolePermissions);
router.put("/roles/:roleCode/permissions", updateRolePermissions);

export default router;
