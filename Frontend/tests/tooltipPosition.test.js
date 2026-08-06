import assert from "node:assert/strict";
import test from "node:test";

import { getTooltipViewportOffset } from "../src/components/ui/Tooltip/tooltipPosition.js";

test("tooltip remains unchanged when it fits inside the viewport", () => {
  assert.deepEqual(
    getTooltipViewportOffset({
      bottom: 160,
      left: 100,
      right: 220,
      top: 120,
      viewportHeight: 800,
      viewportWidth: 1200,
    }),
    { offsetX: 0, offsetY: 0 },
  );
});

test("tooltip is moved inside every viewport edge", () => {
  assert.deepEqual(
    getTooltipViewportOffset({
      bottom: 810,
      left: -12,
      right: 110,
      top: 760,
      viewportHeight: 800,
      viewportWidth: 1200,
    }),
    { offsetX: 20, offsetY: -18 },
  );

  assert.deepEqual(
    getTooltipViewportOffset({
      bottom: 70,
      left: 1120,
      right: 1212,
      top: -4,
      viewportHeight: 800,
      viewportWidth: 1200,
    }),
    { offsetX: -20, offsetY: 12 },
  );
});
