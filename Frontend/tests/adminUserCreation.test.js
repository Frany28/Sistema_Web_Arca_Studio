import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("admin users expose the connected creation modal from both new actions", async () => {
  const [page, modal, http] = await Promise.all([
    readFile(new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/admin-users/CreateAdminUserModal.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/api/http.js", import.meta.url), "utf8"),
  ]);

  assert.match(page, /setIsCreateUserOpen\(true\)/);
  assert.match(page, /api\.admin\.createUser\(payload\)/);
  assert.match(page, /<CreateAdminUserModal/);
  assert.match(modal, /role="dialog"/);
  assert.match(modal, /Crear usuario/);
  assert.match(modal, /Ingresa nombre y apellido/);
  assert.match(http, /createUser\(payload\)[\s\S]*\/admin\/users[\s\S]*method: "POST"/);
});

test("admin user row actions expose the connected Figma status menu", async () => {
  const [page, menu, modal, http] = await Promise.all([
    readFile(new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/admin-users/AdminUserActionsMenu.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/admin-users/AdminUserStatusModal.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/api/http.js", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<AdminUserActionsMenu/);
  assert.match(menu, /role="menu"/);
  assert.match(menu, /Suspender/);
  assert.match(menu, /Deshabilitar/);
  assert.match(menu, /Reactivar/);
  assert.match(menu, /Habilitar/);
  assert.match(page, /<AdminUserStatusModal/);
  assert.match(page, /<AlertToast/);
  assert.match(modal, /¿Deseas suspender al usuario\?/);
  assert.match(modal, /¿Deseas deshabilitar al usuario\?/);
  assert.match(modal, /¿Deseas reactivar al usuario\?/);
  assert.match(modal, /¿Deseas habilitar al usuario\?/);
  assert.match(modal, /onPrimaryAction=\{onConfirm\}/);
  assert.match(modal, /secondaryActionTheme="Danger"/);
  assert.match(modal, /primaryActionTheme=\{change\.status === "active" \? "Primary" : "Danger"\}/);
  assert.match(modal, /text-\[var\(--color-danger-100\)\]/);
  assert.doesNotMatch(modal, /text-\[var\(--color-warning-200\)\]/);
  assert.match(page, /if \(change\) changeUserStatus\(change\.user, change\.status\)/);
  assert.match(page, /String\(user\?\.id\) === String\(listedUser\.id\)/);
  assert.match(menu, /createPortal/);
  assert.match(http, /updateUserStatus[\s\S]*\/admin\/users\/\$\{encodeURIComponent\(userId\)\}\/status[\s\S]*method: "PATCH"/);
});
