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

test("selected admin user rows share the dashboard selection surface", async () => {
  const source = await readFile(
    new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /const isSelected = selectedUserIds\.has\(String\(listedUser\.id\)\)/);
  assert.match(source, /isSelected[\s\S]*bg-\[var\(--color-neutral-300\)\]/);
  assert.match(source, /data-selected=\{isSelected \? "true" : undefined\}/);
  assert.match(source, /checked=\{isSelected \? "Yes" : "No"\}/);
  assert.match(source, /className={`h-\[68px\] transition-colors duration-150/);
  assert.match(source, /<table className="w-full min-w-\[1092px\] table-fixed border-collapse text-left">/);
});

test("admin user body rows follow the Figma typography hierarchy", async () => {
  const source = await readFile(
    new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /text-body-4 truncate text-\[var\(--color-text-300\)\]">\{listedUser\.name\}/);
  assert.match(source, /text-heading-8 truncate px-\[24px\] py-\[16px\] text-\[var\(--color-text-300\)\]">\{listedUser\.email\}/);
  assert.match(source, /text-heading-8 px-\[24px\] py-\[16px\] text-\[var\(--color-text-300\)\]">\{formatRelativeTime/);
});

test("admin user filters match the Figma control dimensions", async () => {
  const source = await readFile(
    new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /items-center gap-\[12px\][^\n]*min-\[900px\]:grid-cols-\[180px_180px_129px\]/);
  assert.equal((source.match(/min-\[900px\]:w-\[180px\]/g) || []).length, 2);
  assert.match(source, /type="Solid" size="M" fitContent[^\n]*Quitar filtros/);
});

test("admin user filters support multiple checkbox selections and four visible rows", async () => {
  const [source, httpSource] = await Promise.all([
    readFile(new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/api/http.js", import.meta.url), "utf8"),
  ]);

  assert.equal((source.match(/\n\s+multiple\n/g) || []).length, 2);
  assert.match(source, /items=\{roleItems\}[\s\S]*onItemsChange=\{changeRoleFilters\}/);
  assert.match(source, /items=\{statusItems\}[\s\S]*onItemsChange=\{changeStatusFilters\}/);
  assert.equal((source.match(/max-h-\[168px\]/g) || []).length, 2);
  assert.equal((source.match(/max-h-\[168px\][^\n]*overflow-y-auto/g) || []).length, 2);
  assert.equal((source.match(/rowHeightClassName="h-\[35px\]"/g) || []).length, 2);
  assert.match(httpSource, /Array\.isArray\(role\) \? role\.join\(","\) : role/);
  assert.match(httpSource, /Array\.isArray\(status\) \? status\.join\(","\) : status/);
});
