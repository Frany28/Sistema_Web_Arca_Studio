import assert from "node:assert/strict";
import test from "node:test";

import {
  adminAssigneePhotoSchema,
  projectAssigneesSchema,
  projectRequestAssigneesSchema,
} from "../src/validation/adminDashboardSchemas.js";

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
