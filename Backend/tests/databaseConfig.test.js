import test from "node:test";
import assert from "node:assert/strict";

process.env.DATABASE_URL ||= "postgresql://user:password@localhost:5432/database";

const { isReadOnlyQuery, isTransientDatabaseError } = await import("../src/config/db.js");

test("identifica errores transitorios de PostgreSQL", () => {
  assert.equal(isTransientDatabaseError({ code: "53300" }), true);
  assert.equal(isTransientDatabaseError({ code: "08006" }), true);
  assert.equal(
    isTransientDatabaseError({ message: "Connection terminated unexpectedly" }),
    true,
  );
  assert.equal(
    isTransientDatabaseError({
      code: "XX000",
      message: "(EMAXCONNSESSION) max clients reached in session mode",
    }),
    true,
  );
});

test("no reintenta errores permanentes de consulta", () => {
  assert.equal(isTransientDatabaseError({ code: "42703" }), false);
  assert.equal(isTransientDatabaseError({ code: "23505" }), false);
});

test("solo permite reintentos automáticos para lecturas", () => {
  assert.equal(isReadOnlyQuery("  select id from projects"), true);
  assert.equal(isReadOnlyQuery("update projects set name = $1"), false);
  assert.equal(isReadOnlyQuery("with updated as (update projects set name = $1) select * from updated"), false);
});
