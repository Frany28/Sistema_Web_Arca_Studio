import assert from "node:assert/strict";
import test from "node:test";

import { getVisibleProjectStages } from "../src/utils/projectOverviewStages.js";

test("project overview starts at the active phase and includes at most three following phases", () => {
  const stages = [
    { id: "brief", tone: "completed" },
    { id: "design", tone: "active" },
    { id: "planning", tone: "pending" },
    { id: "execution", tone: "pending" },
    { id: "delivery", tone: "pending" },
    { id: "warranty", tone: "pending" },
  ];

  assert.deepEqual(
    getVisibleProjectStages(stages).map((stage) => stage.id),
    ["design", "planning", "execution", "delivery"],
  );
});

test("project overview handles missing active and final phases", () => {
  assert.deepEqual(
    getVisibleProjectStages([
      { id: "execution", tone: "completed" },
      { id: "delivery", tone: "pending" },
    ]).map((stage) => stage.id),
    ["execution", "delivery"],
  );
  assert.deepEqual(getVisibleProjectStages(null), []);
});
