import assert from "node:assert/strict";
import test from "node:test";

import { getEnvironmentCommentAccess } from "../src/utils/environmentCommentAccess.js";

test("administrators can see every environment observation", () => {
  assert.deepEqual(
    getEnvironmentCommentAccess({ id: 1, role: { code: "admin" } }),
    { params: [], sql: "true" },
  );
});

test("clients see their own observations and users from shared client projects", () => {
  const access = getEnvironmentCommentAccess({
    clientId: 40,
    id: 12,
    role: { code: "client" },
  });

  assert.deepEqual(access.params, [12, 40]);
  assert.match(access.sql, /scope_user\.id = \$1/);
  assert.match(access.sql, /shared_project\.client_id = \$2/);
  assert.match(access.sql, /assigned_architect_id = scope_user\.id/);
});

test("architects only share observations through assigned projects", () => {
  const access = getEnvironmentCommentAccess({
    id: 22,
    role: { code: "architect" },
  });

  assert.deepEqual(access.params, [22]);
  assert.match(access.sql, /shared_project\.assigned_architect_id = \$1/);
  assert.doesNotMatch(access.sql, /shared_project\.client_id = \$2/);
});

test("unsupported users cannot read environment observations", () => {
  assert.deepEqual(
    getEnvironmentCommentAccess({ id: 9, role: { code: "support" } }),
    { params: [], sql: "false" },
  );
});
