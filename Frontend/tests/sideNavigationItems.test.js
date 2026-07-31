import assert from "node:assert/strict";
import test from "node:test";

import {
  createUserSideNavigationItems,
  getDashboardPath,
} from "../src/utils/sideNavigationItems.js";

test("client navigation keeps requests in every environment", () => {
  const ids = createUserSideNavigationItems([], "client").map(({ id }) => id);
  assert.deepEqual(ids, ["dashboard", "requests", "more-projects", "settings"]);
});

test("architect and admin navigation only exposes authorized shared destinations", () => {
  for (const role of ["architect", "admin"]) {
    const ids = createUserSideNavigationItems([], role).map(({ id }) => id);
    assert.deepEqual(ids, ["dashboard", "more-projects", "settings"]);
  }
});

test("project shortcuts preserve the shared navigation actions", () => {
  const items = createUserSideNavigationItems(
    [{ id: 10, name: "Proyecto Norte", isPublic: true }],
    "client",
  );
  assert.equal(items[1].id, "project-10");
  assert.equal(items[1].trailingIcon, "window");
  assert.equal(items.at(-1).id, "settings");
});

test("dashboard destinations follow the authenticated role", () => {
  assert.equal(getDashboardPath("client"), "/dashboard-clientes");
  assert.equal(getDashboardPath("architect"), "/dashboard-arquitecto");
  assert.equal(getDashboardPath("admin"), "/dashboard-arquitecto");
});
