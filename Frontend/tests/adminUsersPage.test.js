import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("admin user management keeps the shared navigation and users tab active", async () => {
  const source = await readFile(
    new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /components\/EnvironmentNavigationBar\.jsx/);
  assert.match(source, /activeItemId="users"/);
  assert.match(source, /Gestión de usuarios/);
  assert.match(source, /w-\[235px\]/);
  assert.match(source, /text-heading-4/);
  assert.match(source, /iconType="Disabled"/);
  assert.match(source, /api\.admin\.listUsers/);
});

test("the admin users route is protected for administrators", async () => {
  const source = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");

  assert.match(source, /allowedRoles=\{\["admin"\]\}[\s\S]*path="\/usuarios"/);
});

test("admin user table footer follows the detached Figma pagination layout", async () => {
  const source = await readFile(
    new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /text-heading-8 text-\[var\(--color-text-300\)\]/);
  assert.match(source, /type="Outline" size="M"[\s\S]*Anterior/);
  assert.match(source, /type="Solid" size="M"[\s\S]*Siguiente pág\./);
  assert.doesNotMatch(source, /gap-\[12px\] border-t border-\[var\(--color-neutral-200\)\] px-\[16px\] py-\[12px\]/);
});
