import assert from "node:assert/strict";
import test from "node:test";

import {
  applyGamepadDeadzone,
  getXRMovementAxes,
} from "../src/utils/vrLocomotion.js";

test("VR locomotion ignores controller drift and rescales intentional input", () => {
  assert.equal(applyGamepadDeadzone(0.1), 0);
  assert.equal(applyGamepadDeadzone(-0.18), 0);
  assert.ok(applyGamepadDeadzone(0.6) > 0);
  assert.ok(applyGamepadDeadzone(-0.6) < 0);
});

test("VR locomotion reads standard thumbstick axes from the left controller", () => {
  const axes = getXRMovementAxes([
    {
      gamepad: { axes: [0, 0, 0.5, -0.75] },
      handedness: "left",
    },
  ]);

  assert.ok(axes.x > 0);
  assert.ok(axes.y < 0);
});

test("VR locomotion supports two-axis touchpads and controller fallback", () => {
  const axes = getXRMovementAxes([
    { gamepad: { axes: [0, 0] }, handedness: "left" },
    { gamepad: { axes: [-0.8, 0.4] }, handedness: "right" },
  ]);

  assert.ok(axes.x < 0);
  assert.ok(axes.y > 0);
});
