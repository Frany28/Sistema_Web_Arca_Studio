import assert from "node:assert/strict";
import test from "node:test";

import {
  formatObservationReplyCount,
  getAdaptiveObservationTooltipPlacement,
  getObservationAuthorInitials,
} from "../src/components/ui/ObservationTooltip/observationTooltip.js";

test("observation tooltip derives stable avatar initials", () => {
  assert.equal(getObservationAuthorInitials("Armando Carroz"), "AC");
  assert.equal(getObservationAuthorInitials("Armando"), "AR");
  assert.equal(getObservationAuthorInitials(""), "U");
});

test("observation tooltip stays centered, bounded and flips near the viewport edge", () => {
  const centered = getAdaptiveObservationTooltipPlacement({
    anchorBottom: 340, anchorTop: 300, anchorX: 500,
    tooltipHeight: 120, tooltipWidth: 210,
    viewportHeight: 800, viewportWidth: 1000,
  });
  assert.equal(centered.placement, "top");
  assert.equal(centered.left, 500);
  assert.equal(centered.corner, "bottom-left");

  const edge = getAdaptiveObservationTooltipPlacement({
    anchorBottom: 52, anchorTop: 12, anchorX: 18,
    tooltipHeight: 120, tooltipWidth: 210,
    viewportHeight: 800, viewportWidth: 1000,
  });
  assert.equal(edge.placement, "bottom");
  assert.equal(edge.left, 18);
  assert.equal(edge.corner, "top-left");
});

test("observation tooltip formats live reply totals", () => {
  assert.equal(formatObservationReplyCount(0), "0 respuestas");
  assert.equal(formatObservationReplyCount(1), "1 respuesta");
  assert.equal(formatObservationReplyCount(3), "3 respuestas");
});

test("document tooltip expands upward from its marker position", () => {
  const placement = getAdaptiveObservationTooltipPlacement({
    anchorBottom: 140, anchorLeft: 100, anchorRight: 140,
    anchorTop: 100, anchorX: 120, replaceAnchor: true,
    tooltipHeight: 128, tooltipWidth: 210,
    viewportHeight: 600, viewportWidth: 800,
  });

  assert.equal(placement.left, 100);
  assert.equal(placement.top, 12);
  assert.equal(placement.corner, "bottom-left");
  assert.equal(placement.placement, "anchor-top");
});
