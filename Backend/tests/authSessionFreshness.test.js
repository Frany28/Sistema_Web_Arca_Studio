import assert from "node:assert/strict";
import test from "node:test";

const { isTokenOlderThanUser } = await import(
  "../src/utils/sessionFreshness.js"
);

test("a token renewed after a profile update tolerates small database clock drift", () => {
  const payload = { iat: 1_700_000_000 };
  const user = { updatedAt: new Date(1_700_000_004_500).toISOString() };

  assert.equal(isTokenOlderThanUser(payload, user, 5000), false);
});

test("a token issued before an actual user change is rejected", () => {
  const payload = { iat: 1_700_000_000 };
  const user = { updatedAt: new Date(1_700_000_006_000).toISOString() };

  assert.equal(isTokenOlderThanUser(payload, user, 5000), true);
});

test("invalid session timestamps fail closed", () => {
  assert.equal(
    isTokenOlderThanUser(
      { iat: "invalid" },
      { updatedAt: "invalid" },
      5000,
    ),
    true,
  );
});
