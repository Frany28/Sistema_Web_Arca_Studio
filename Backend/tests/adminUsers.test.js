import assert from "node:assert/strict";
import test from "node:test";

import { adminUserListSchema } from "../src/validation/adminUserSchemas.js";
import { encodeCursor } from "../src/utils/pagination.js";
import { mapAdminUser, mapAdminUserMetrics } from "../src/utils/adminUsers.js";

test("admin user filters validate cursor, role and database statuses", () => {
  const result = adminUserListSchema.safeParse({
    query: {
      cursor: encodeCursor(["2026-08-19T12:00:00.000Z", "42"]),
      limit: "10",
      role: "architect",
      search: "Ana",
      status: "blocked",
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.data.query.limit, 10);
  assert.equal(adminUserListSchema.safeParse({ query: { status: "deleted" } }).success, false);
});

test("admin users expose the public management fields and normalized metrics", () => {
  assert.deepEqual(mapAdminUser({
    id: "12",
    first_name: "Ana",
    last_name: "Pérez",
    email: "ana@example.com",
    role_code: "architect",
    role_name: "Arquitecto",
    status: "active",
    last_login_at: null,
    created_at: "2026-08-19T12:00:00.000Z",
  }), {
    id: 12,
    name: "Ana Pérez",
    email: "ana@example.com",
    role: { code: "architect", name: "Arquitecto" },
    status: "active",
    lastLoginAt: null,
    createdAt: "2026-08-19T12:00:00.000Z",
  });
  assert.deepEqual(mapAdminUserMetrics({ total: "20", active: "10", suspended: "5", disabled: "5" }), {
    total: 20,
    active: 10,
    suspended: 5,
    disabled: 5,
  });
});
