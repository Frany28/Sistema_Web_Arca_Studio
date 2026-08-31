import assert from "node:assert/strict";
import test from "node:test";

import { getBulkStatusTargets } from "../src/pages/admin-users/adminUserStatusPolicy.js";

const USERS = [
  { id: 1, status: "active" },
  { id: 2, status: "blocked" },
  { id: 3, status: "inactive" },
  { id: 4, status: "active" },
];
const selectedUserIds = new Set(USERS.map(({ id }) => String(id)));

function targetIds(status, actorUserId = 4) {
  return getBulkStatusTargets({
    actorUserId,
    selectedUserIds,
    status,
    users: USERS,
  }).map(({ id }) => id);
}

test("bulk suspension applies only to active users other than the current admin", () => {
  assert.deepEqual(targetIds("blocked"), [1]);
});

test("bulk disabling applies to active and suspended users", () => {
  assert.deepEqual(targetIds("inactive"), [1, 2]);
});

test("bulk activation applies only to suspended and disabled users", () => {
  assert.deepEqual(targetIds("active"), [2, 3]);
});

test("bulk status policy rejects unsupported transitions", () => {
  assert.deepEqual(targetIds("deleted"), []);
});

test("a mixed partial selection routes every action to its eligible statuses", () => {
  const mixedSelection = new Set(["1", "2", "3"]);
  const targetsFor = (status) => getBulkStatusTargets({
    actorUserId: 99,
    selectedUserIds: mixedSelection,
    status,
    users: USERS,
  }).map(({ id }) => id);

  assert.deepEqual(targetsFor("blocked"), [1]);
  assert.deepEqual(targetsFor("inactive"), [1, 2]);
  assert.deepEqual(targetsFor("active"), [2, 3]);
});
