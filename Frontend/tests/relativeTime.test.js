import assert from "node:assert/strict";
import test from "node:test";

import { formatRelativeTime } from "../src/utils/relativeTime.js";

const NOW = new Date("2026-08-18T12:00:00.000Z").getTime();

test("relative time formats recent administrative events", () => {
  assert.equal(
    formatRelativeTime("2026-08-18T11:55:00.000Z", NOW),
    "Hace 5 min",
  );
  assert.equal(
    formatRelativeTime("2026-08-16T12:00:00.000Z", NOW),
    "Hace 2 d",
  );
});

test("relative time accepts a contextual fallback", () => {
  assert.equal(
    formatRelativeTime(null, NOW, "Sin eventos recientes"),
    "Sin eventos recientes",
  );
});
