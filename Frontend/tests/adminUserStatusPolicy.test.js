import assert from "node:assert/strict";
import test from "node:test";

import { getBulkStatusTargets } from "../src/pages/admin-users/adminUserStatusPolicy.js";

const USERS = [
  { id: 1, status: "active" },
  { id: 2, status: "blocked" },
  { id: 3, status: "inactive" },
  { id: 4, status: "active" },
];
function targetIds(status, selectedIds, actorUserId = 4) {
  return getBulkStatusTargets({
    actorUserId,
    selectedUserIds: new Set(selectedIds.map(String)),
    status,
    users: USERS,
  }).map(({ id }) => id);
}

test("bulk suspension is enabled only when every selected user is active", () => {
  assert.deepEqual(targetIds("blocked", [1]), [1]);
  assert.deepEqual(targetIds("blocked", [1, 2]), []);
});

test("bulk disabling accepts a selection made only of active and suspended users", () => {
  assert.deepEqual(targetIds("inactive", [1, 2]), [1, 2]);
  assert.deepEqual(targetIds("inactive", [1, 3]), []);
});

test("bulk activation accepts a selection made only of suspended and disabled users", () => {
  assert.deepEqual(targetIds("active", [2, 3]), [2, 3]);
  assert.deepEqual(targetIds("active", [1, 2]), []);
});

test("bulk status policy rejects unsupported transitions", () => {
  assert.deepEqual(targetIds("deleted", [1]), []);
});

test("a mixed selection does not enable actions for only a hidden subset", () => {
  assert.deepEqual(targetIds("blocked", [1, 2, 3], 99), []);
  assert.deepEqual(targetIds("inactive", [1, 2, 3], 99), []);
  assert.deepEqual(targetIds("active", [1, 2, 3], 99), []);
});

test("bulk actions cannot include the current administrator", () => {
  assert.deepEqual(targetIds("blocked", [1, 4], 4), []);
  assert.deepEqual(targetIds("inactive", [1, 4], 4), []);
});

test("bulk actions reject selections that are not present in the loaded users", () => {
  assert.deepEqual(targetIds("blocked", [1, 999], 4), []);
});
