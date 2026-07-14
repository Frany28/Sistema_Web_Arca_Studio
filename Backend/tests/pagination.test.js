import assert from "node:assert/strict";
import test from "node:test";
import { decodeCursor, encodeCursor, pageResult, parsePageLimit } from "../src/utils/pagination.js";

test("pagination limits are bounded", () => {
  assert.equal(parsePageLimit(undefined), 25);
  assert.equal(parsePageLimit("0"), 25);
  assert.equal(parsePageLimit("200"), 100);
  assert.equal(parsePageLimit("50"), 50);
});

test("cursor is opaque and rejects malformed values", () => {
  const cursor = encodeCursor(["2026-07-13T00:00:00.000Z", "42"]);
  assert.deepEqual(decodeCursor(cursor), ["2026-07-13T00:00:00.000Z", "42"]);
  assert.equal(decodeCursor("not-a-cursor"), null);
});

test("pageResult returns one extra row as next cursor", () => {
  const result = pageResult([{ id: 3 }, { id: 2 }, { id: 1 }], 2, (row) => row.id, (row) => [row.id, row.id]);
  assert.deepEqual(result.items, [3, 2]);
  assert.deepEqual(decodeCursor(result.nextCursor), [2, 2]);
});
