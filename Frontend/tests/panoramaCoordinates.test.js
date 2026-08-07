import assert from "node:assert/strict";
import test from "node:test";

import {
  getPanoramaCameraOrientation,
  getPanoramaDirection,
  getPanoramaOrientation,
} from "../src/utils/panoramaCoordinates.js";

test("panorama orientation preserves yaw and pitch", () => {
  assert.deepEqual(getPanoramaOrientation({ kind: "panorama-point", yaw: 45, pitch: -12 }), { yaw: 45, pitch: -12 });
  assert.deepEqual(getPanoramaOrientation({ selection: { yaw: 10, pitch: 20 } }), { yaw: 10, pitch: 20 });
});

test("legacy sphere positions convert to panorama orientation", () => {
  const orientation = getPanoramaOrientation({ viewerPoint: { modelPosition: { x: 1, y: 0, z: 0 } } });
  assert.equal(Math.round(orientation.yaw), 90);
  assert.equal(Math.round(orientation.pitch), 0);
});

test("panorama directions use the viewer coordinate system", () => {
  assert.deepEqual(getPanoramaDirection(0, 0, 10), { x: 0, y: 0, z: -10 });
  const right = getPanoramaDirection(90, 0, 10);
  assert.ok(Math.abs(right.x - 10) < 1e-10);
  assert.ok(Math.abs(right.z) < 1e-10);
});

test("panorama comments restore the camera view captured with the point", () => {
  const orientation = getPanoramaCameraOrientation({
    viewerPoint: {
      cameraOrbit: {
        theta: Math.PI / 4,
        phi: Math.PI / 3,
      },
    },
  });

  assert.ok(Math.abs(orientation.yaw - 45) < 1e-10);
  assert.ok(Math.abs(orientation.pitch - 30) < 1e-10);
  assert.equal(getPanoramaCameraOrientation({ yaw: 10, pitch: 20 }), null);
});
