import assert from "node:assert/strict";
import test from "node:test";

import {
  formatHumanDate,
  formatRelativeTime,
} from "../src/utils/relativeTime.js";

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

test("last access time uses natural singular labels", () => {
  assert.equal(
    formatHumanDate("2026-08-18T11:59:00.000Z", NOW),
    "Hace 1 minuto",
  );
  assert.equal(
    formatHumanDate("2026-08-18T11:00:00.000Z", NOW),
    "Hace 1 hora",
  );
  assert.equal(
    formatHumanDate("2026-08-17T12:00:00.000Z", NOW),
    "Hace 1 día",
  );
});

test("last access time switches from days to one month after 30 days", () => {
  assert.equal(
    formatHumanDate("2026-07-19T12:00:00.000Z", NOW),
    "Hace 30 días",
  );
  assert.equal(
    formatHumanDate("2026-07-18T12:00:00.000Z", NOW),
    "Hace un mes",
  );
  assert.equal(
    formatHumanDate("2026-06-20T12:00:00.000Z", NOW),
    "Hace un mes",
  );
});

test("last access time uses an exact localized date after the one-month range", () => {
  assert.equal(
    formatHumanDate("2026-06-19T12:00:00.000Z", NOW),
    "19 jun",
  );
  assert.equal(
    formatHumanDate("2025-02-17T12:00:00.000Z", NOW),
    "17 feb 2025",
  );
});

test("relative time accepts a contextual fallback", () => {
  assert.equal(
    formatRelativeTime(null, NOW, "Sin eventos recientes"),
    "Sin eventos recientes",
  );
});

test("human date accepts a contextual fallback", () => {
  assert.equal(formatHumanDate(null, NOW, "Sin acceso"), "Sin acceso");
});
