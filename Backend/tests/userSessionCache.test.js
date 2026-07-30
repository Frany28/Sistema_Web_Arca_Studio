import assert from "node:assert/strict";
import test from "node:test";
import {
  cacheUser,
  clearUserSessionCache,
  getCachedUser,
  getOrLoadUser,
  invalidateCachedUser,
} from "../src/services/userSessionCache.js";

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

test("concurrent session loads for the same user share one query", async () => {
  let loads = 0;
  const loader = async () => {
    loads += 1;
    await Promise.resolve();
    return { id: 11 };
  };

  const [first, second] = await Promise.all([
    getOrLoadUser(11, loader),
    getOrLoadUser(11, loader),
  ]);

  assert.equal(loads, 1);
  assert.equal(first, second);
});

test("different users are isolated and failed loads are never cached", async () => {
  let failedLoads = 0;
  await assert.rejects(
    getOrLoadUser(20, async () => {
      failedLoads += 1;
      throw new Error("database unavailable");
    }),
  );
  await assert.rejects(
    getOrLoadUser(20, async () => {
      failedLoads += 1;
      throw new Error("database unavailable");
    }),
  );

  const [first, second] = await Promise.all([
    getOrLoadUser(21, async () => ({ id: 21 })),
    getOrLoadUser(22, async () => ({ id: 22 })),
  ]);

  assert.equal(failedLoads, 2);
  assert.equal(first.id, 21);
  assert.equal(second.id, 22);
});
