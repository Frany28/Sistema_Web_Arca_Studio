import assert from "node:assert/strict";
import test from "node:test";
import { cacheUser, clearUserSessionCache, getCachedUser, invalidateCachedUser } from "../src/services/userSessionCache.js";

test.afterEach(clearUserSessionCache);

test("session cache stores safe users and invalidates by id", () => {
  const user = { id: 7, permissionCodes: ["projects.read"] };
  cacheUser(7, user);
  assert.equal(getCachedUser(7), user);
  invalidateCachedUser(7);
  assert.equal(getCachedUser(7), null);
});

test("session cache honors TTL", async () => {
  const previous = process.env.AUTH_CACHE_TTL_MS;
  process.env.AUTH_CACHE_TTL_MS = "1";
  cacheUser(8, { id: 8 });
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(getCachedUser(8), null);
  if (previous === undefined) delete process.env.AUTH_CACHE_TTL_MS;
  else process.env.AUTH_CACHE_TTL_MS = previous;
});
