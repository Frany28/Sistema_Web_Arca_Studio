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

test("selected admin users expose centered bulk status actions", async () => {
  const [source, modalSource] = await Promise.all([
    readFile(new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/admin-users/AdminUserStatusModal.jsx", import.meta.url), "utf8"),
  ]);

  assert.match(source, /grid-cols-\[1fr_auto_1fr\]/);
  assert.match(source, /selectedCount \? BULK_STATUS_ACTIONS\.map/);
  assert.match(source, /label: "Suspender", status: "blocked"/);
  assert.match(source, /label: "Deshabilitar", status: "inactive"/);
  assert.match(source, /label: "Activar", status: "active"/);
  assert.match(source, /Promise\.allSettled/);
  assert.match(source, /selectionCount: selectedCount/);
  assert.match(source, /<AlertToast/);
  assert.match(modalSource, /getBulkActionDetails/);
  assert.match(modalSource, /no cumplen las condiciones para este cambio/);
  assert.match(modalSource, /<Modal/);
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
  assert.match(source, /text-heading-8 px-\[24px\] py-\[16px\] text-\[var\(--color-text-300\)\]">\{formatHumanDate/);
});

test("admin user role cells use the filled brand badge from Figma", async () => {
  const source = await readFile(
    new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /<td className="px-\[24px\] py-\[16px\]"><Badge label=\{listedUser\.role\?\.name \|\| "Sin rol"\} theme="Brand 1" variation="Simple" size="S" \/><\/td>/,
  );
});

test("admin user rows use authenticated profile photos with avatar fallback", async () => {
  const [pageSource, httpSource] = await Promise.all([
    readFile(new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/api/http.js", import.meta.url), "utf8"),
  ]);

  assert.match(pageSource, /src: listedUser\.profilePhotoUrl/);
  assert.match(httpSource, /function withAdminUserAvatar/);
  assert.match(httpSource, /function withAdminUserAvatars/);
  assert.match(
    httpSource,
    /\/admin\/users\/\$\{encodeURIComponent\(listedUser\.id\)\}\/profile-photo/,
  );
  assert.match(httpSource, /return withAdminUserAvatars\(payload\)/);
  assert.match(httpSource, /user: withAdminUserAvatar\(payload\?\.user\)/);
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
