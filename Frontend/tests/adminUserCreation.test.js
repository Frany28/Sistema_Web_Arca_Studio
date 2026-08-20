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
  const [page, menu, http] = await Promise.all([
    readFile(new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/admin-users/AdminUserActionsMenu.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/api/http.js", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<AdminUserActionsMenu/);
  assert.match(menu, /role="menu"/);
  assert.match(menu, /Suspender/);
  assert.match(menu, /Deshabilitar/);
  assert.match(menu, /createPortal/);
  assert.match(http, /updateUserStatus[\s\S]*\/admin\/users\/\$\{encodeURIComponent\(userId\)\}\/status[\s\S]*method: "PATCH"/);
});
