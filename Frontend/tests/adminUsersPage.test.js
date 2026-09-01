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
  assert.match(source, /const ADMIN_USERS_PAGE_SIZE = 10/);
  assert.match(source, /limit: ADMIN_USERS_PAGE_SIZE/);
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

test("the user details action opens the Figma drawer with live API data", async () => {
  const [pageSource, drawerSource, httpSource] = await Promise.all([
    readFile(new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/admin-users/AdminUserDetailsDrawer.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/api/http.js", import.meta.url), "utf8"),
  ]);

  assert.match(pageSource, /tooltip="Detalles de usuario"/);
  assert.match(pageSource, /onClick=\{\(\) => setDetailsUserId\(listedUser\.id\)\}/);
  assert.match(pageSource, /<AdminUserDetailsDrawer/);
  assert.match(drawerSource, /Detalles de Usuario/);
  assert.match(drawerSource, /formatCalendarDate\(user\.createdAt\)/);
  assert.match(drawerSource, /projects\.map/);
  assert.match(drawerSource, /api\.admin\.getUserDetails/);
  assert.match(drawerSource, /text-heading-8 text-\[var\(--color-text-300\)\]">\{label\}/);
  assert.match(drawerSource, /text-heading-8 m-0 break-words text-\[var\(--color-text-200\)\]/);
  assert.doesNotMatch(drawerSource, /Añadir nota/);
  assert.doesNotMatch(drawerSource, />Cancelar</);
  assert.match(drawerSource, /<ComposerSubmitButton/);
  assert.match(drawerSource, /event\.key === "Enter" && !event\.shiftKey/);
  assert.match(drawerSource, /ariaLabel=\{editor === "new" \? "Guardar nota" : "Guardar cambios"\}/);
  assert.match(drawerSource, /placeholder="Anotaciones\.\.\."/);
  assert.match(drawerSource, /<HintText hintText="Solo visible para ti\."/);
  assert.match(drawerSource, /items-start justify-between gap-\[8px\]/);
  assert.match(drawerSource, /showLabel=\{false\}/);
  assert.match(drawerSource, /Sin anotaciones\./);
  assert.match(drawerSource, /Ver todas \(\$\{notesTotal\}\)/);
  assert.match(drawerSource, /max-h-\[248px\][^"\n]*overflow-y-auto/);
  assert.match(drawerSource, /rounded-\[var\(--radius-2\)\][^"\n]*border[^"\n]*bg-\[var\(--color-neutral-10\)\]/);
  assert.match(drawerSource, /border-t border-\[var\(--color-neutral-200\)\] pt-\[8px\]/);
  assert.match(drawerSource, /api\.admin\.createUserNote/);
  assert.match(drawerSource, /api\.admin\.updateUserNote/);
  assert.match(drawerSource, /<AlertToast/);
  assert.doesNotMatch(drawerSource, /readOnly/);
  assert.match(httpSource, /getUserDetails\(\{ signal, userId \}\)/);
  assert.match(httpSource, /listUserNotes\(\{ cursor, limit = 25, signal, userId \}\)/);
});
