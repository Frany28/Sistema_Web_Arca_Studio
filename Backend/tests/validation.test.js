import assert from "node:assert/strict";
import test from "node:test";
import { normalizeError, ValidationError } from "../src/errors/appError.js";
import { loginSchema, paginationSchema } from "../src/validation/schemas.js";

test("login schema normalizes email and rejects short passwords", () => {
  const valid = loginSchema.parse({ body: { email: " USER@EXAMPLE.COM ", password: "Password1!" } });
  assert.equal(valid.body.email, "user@example.com");
  assert.equal(loginSchema.safeParse({ body: { email: "bad", password: "short" } }).success, false);
});

test("pagination schema rejects invalid cursors and limits", () => {
  assert.equal(paginationSchema.safeParse({ query: { cursor: "broken", limit: 101 } }).success, false);
});

test("central errors preserve fields and hide unknown messages", () => {
  const validation = normalizeError(new ValidationError(undefined, { email: "Inválido" }));
  assert.deepEqual(validation.fields, { email: "Inválido" });
  assert.equal(normalizeError(new Error("database secret")).message, "Ocurrió un error inesperado.");
});
