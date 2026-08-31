import assert from "node:assert/strict";
import test from "node:test";

import {
  adminUserCreateSchema,
  adminUserListSchema,
  adminUserPhotoSchema,
  adminUserStatusSchema,
} from "../src/validation/adminUserSchemas.js";
import { encodeCursor } from "../src/utils/pagination.js";
import { mapAdminUser, mapAdminUserMetrics } from "../src/utils/adminUsers.js";

test("admin user filters validate cursor, role and database statuses", () => {
  const result = adminUserListSchema.safeParse({
    query: {
      cursor: encodeCursor(["2026-08-19T12:00:00.000Z", "42"]),
      limit: "10",
      role: "architect,admin",
      search: "Ana",
      status: "blocked,inactive",
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.data.query.limit, 10);
  assert.deepEqual(result.data.query.role, ["architect", "admin"]);
  assert.deepEqual(result.data.query.status, ["blocked", "inactive"]);
  assert.equal(adminUserListSchema.safeParse({ query: { status: "deleted" } }).success, false);
  assert.equal(adminUserListSchema.safeParse({ query: { status: "active,blocked,inactive,active" } }).success, true);
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
    has_profile_photo: true,
    last_login_at: null,
    created_at: "2026-08-19T12:00:00.000Z",
  }), {
    id: 12,
    name: "Ana Pérez",
    email: "ana@example.com",
    role: { code: "architect", name: "Arquitecto" },
    status: "active",
    hasProfilePhoto: true,
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

test("admin user creation validates identity, roles, status and optional phones", () => {
  const result = adminUserCreateSchema.safeParse({
    body: {
      fullName: "Ana Pérez",
      companyName: "ARCA Studio",
      email: "ANA@EXAMPLE.COM",
      roleCode: "architect",
      phone: "+58 414-123-4567",
      secondaryPhone: "+1 (305) 555-0142",
      status: "active",
    },
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data.body.fullName, { firstName: "Ana", lastName: "Pérez" });
  assert.equal(result.data.body.email, "ana@example.com");
  assert.equal(result.data.body.phone, "+584141234567");
  assert.equal(result.data.body.secondaryPhone, "+13055550142");
  assert.equal(adminUserCreateSchema.safeParse({ body: { ...result.data.body, fullName: "Ana" } }).success, false);
  assert.equal(adminUserCreateSchema.safeParse({ body: { ...result.data.body, status: "deleted" } }).success, false);
});

test("admin user status changes accept suspend, disable and enable actions", () => {
  const suspended = adminUserStatusSchema.safeParse({
    params: { userId: "42" },
    body: { status: "blocked" },
  });

  assert.equal(suspended.success, true);
  assert.equal(suspended.data.params.userId, 42);
  assert.equal(adminUserStatusSchema.safeParse({ params: { userId: "0" }, body: { status: "inactive" } }).success, false);
  assert.equal(adminUserStatusSchema.safeParse({ params: { userId: "42" }, body: { status: "active" } }).success, true);
  assert.equal(adminUserStatusSchema.safeParse({ params: { userId: "42" }, body: { status: "deleted" } }).success, false);
});

test("admin user profile photos require a positive user identifier", () => {
  assert.equal(adminUserPhotoSchema.safeParse({ params: { userId: "42" } }).success, true);
  assert.equal(adminUserPhotoSchema.safeParse({ params: { userId: "0" } }).success, false);
});
