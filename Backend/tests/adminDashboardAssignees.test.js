import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adminProjectBulkActionSchema,
  adminAssigneePhotoSchema,
  projectAssigneesSchema,
  projectRequestAssigneesSchema,
} from "../src/validation/adminDashboardSchemas.js";

test("admin project bulk actions validate supported actions and unique ids", () => {
  const valid = adminProjectBulkActionSchema.safeParse({
    body: { action: "archive", projectIds: [3, 8, 13] },
  });
  const visibility = adminProjectBulkActionSchema.safeParse({
    body: {
      action: "change_visibility",
      isPublic: true,
      projectIds: [3, 8],
    },
  });
  const visibilityWithoutTarget = adminProjectBulkActionSchema.safeParse({
    body: { action: "change_visibility", projectIds: [3, 8] },
  });
  const duplicate = adminProjectBulkActionSchema.safeParse({
    body: { action: "unarchive", projectIds: [3, 3] },
  });
  const unsupported = adminProjectBulkActionSchema.safeParse({
    body: { action: "delete", projectIds: [3] },
  });
  const empty = adminProjectBulkActionSchema.safeParse({
    body: { action: "archive", projectIds: [] },
  });

  assert.equal(valid.success, true);
  assert.equal(visibility.success, true);
  assert.equal(visibilityWithoutTarget.success, false);
  assert.deepEqual(valid.data.body.projectIds, [3, 8, 13]);
  assert.equal(duplicate.success, false);
  assert.equal(unsupported.success, false);
  assert.equal(empty.success, false);
});

test("archived projects use a recoverable status instead of disappearing", async () => {
  const schema = await readFile(
    new URL("../prisma/schema.prisma", import.meta.url),
    "utf8",
  );
  const migration = await readFile(
    new URL(
      "../prisma/migrations/20260824101000_recover_admin_archived_projects/migration.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(schema, /archived_from_status\s+project_status\?/);
  assert.match(schema, /enum project_status \{[\s\S]*archived[\s\S]*\}/);
  assert.match(migration, /audit\.action = 'project\.archive'/);
  assert.match(migration, /deleted_at = NULL/);
  assert.match(migration, /status = 'archived'::public\.project_status/);
});

test("project assignments accept multiple unique employee ids", () => {
  const result = projectAssigneesSchema.safeParse({
    body: { assigneeIds: [2, 7, 9] },
    params: { projectId: "14" },
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data.body.assigneeIds, [2, 7, 9]);
  assert.equal(result.data.params.projectId, 14);
});

test("project assignments reject duplicate employee ids", () => {
  const result = projectAssigneesSchema.safeParse({
    body: { assigneeIds: [2, 2] },
    params: { projectId: 14 },
  });

  assert.equal(result.success, false);
});

test("request assignments support clearing all responsible employees", () => {
  const result = projectRequestAssigneesSchema.safeParse({
    body: { assigneeIds: [] },
    params: { projectRequestId: "21" },
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data.body.assigneeIds, []);
});

test("admin assignee photos require a positive user id", () => {
  const valid = adminAssigneePhotoSchema.safeParse({
    params: { userId: "7" },
  });
  const invalid = adminAssigneePhotoSchema.safeParse({
    params: { userId: "0" },
  });

  assert.equal(valid.success, true);
  assert.equal(valid.data.params.userId, 7);
  assert.equal(invalid.success, false);
});
