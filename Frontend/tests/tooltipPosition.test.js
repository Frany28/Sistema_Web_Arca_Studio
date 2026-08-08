import assert from "node:assert/strict";
import test from "node:test";

import {
  getAdaptiveTooltipPosition,
  getTooltipViewportOffset,
} from "../src/components/ui/Tooltip/tooltipPosition.js";

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

test("tooltip flips below the button when there is not enough room above", () => {
  assert.equal(
    getAdaptiveTooltipPosition({
      anchorBottom: 48,
      anchorLeft: 20,
      anchorRight: 52,
      anchorTop: 16,
      preferredPosition: "Top center",
      tooltipHeight: 40,
      tooltipWidth: 120,
      viewportHeight: 800,
      viewportWidth: 1200,
    }),
    "Bottom center",
  );
});

test("tooltip keeps its preferred side when it has enough separation", () => {
  assert.equal(
    getAdaptiveTooltipPosition({
      anchorBottom: 432,
      anchorLeft: 584,
      anchorRight: 616,
      anchorTop: 400,
      preferredPosition: "Top right",
      tooltipHeight: 40,
      tooltipWidth: 120,
      viewportHeight: 800,
      viewportWidth: 1200,
    }),
    "Top right",
  );
});

test("tooltip uses a lateral side when neither vertical side has room", () => {
  assert.equal(
    getAdaptiveTooltipPosition({
      anchorBottom: 55,
      anchorLeft: 100,
      anchorRight: 132,
      anchorTop: 25,
      preferredPosition: "Top center",
      tooltipHeight: 100,
      tooltipWidth: 80,
      viewportHeight: 80,
      viewportWidth: 500,
    }),
    "Right",
  );
});
