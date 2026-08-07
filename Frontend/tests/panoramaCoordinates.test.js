import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";

import {
  getPanoramaDirection,
  getPanoramaFieldOfViewDegrees,
  getPanoramaOrientation,
} from "../src/utils/panoramaCoordinates.js";

function createPanoramaCamera({ aspect, fieldOfView, pitch, yaw }) {
  const camera = new THREE.PerspectiveCamera(fieldOfView, aspect, 0.1, 1100);
  const direction = getPanoramaDirection(yaw, pitch);

  camera.lookAt(direction.x, direction.y, direction.z);
  camera.updateMatrixWorld(true);

  return camera;
}

function getRayOrientation(camera, normalizedX, normalizedY) {
  const raycaster = new THREE.Raycaster();

  raycaster.setFromCamera(
    new THREE.Vector2(normalizedX * 2 - 1, 1 - normalizedY * 2),
    camera,
  );

  return getPanoramaOrientation({
    viewerPoint: { modelPosition: raycaster.ray.direction },
  });
}

function projectOrientation(camera, orientation) {
  const direction = getPanoramaDirection(
    orientation.yaw,
    orientation.pitch,
    10,
  );
  const projected = new THREE.Vector3(
    direction.x,
    direction.y,
    direction.z,
  ).project(camera);

  return {
    x: (projected.x + 1) / 2,
    y: (1 - projected.y) / 2,
  };
}

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

test("legacy comments without saved zoom preserve the current field of view", () => {
  assert.equal(getPanoramaFieldOfViewDegrees(null), null);
  assert.equal(getPanoramaFieldOfViewDegrees(undefined), null);
  assert.ok(
    Math.abs(getPanoramaFieldOfViewDegrees(Math.PI / 3) - 60) < 1e-10,
  );
});

test("null panorama coordinates are not mistaken for the center", () => {
  assert.equal(getPanoramaOrientation({ yaw: null, pitch: null }), null);
});

test("a panorama click projects back to the exact same screen position", () => {
  const camera = createPanoramaCamera({
    aspect: 1592 / 861,
    fieldOfView: 55,
    pitch: -8,
    yaw: -78.47,
  });
  const clickedPoint = { x: 0.7368090452261307, y: 0.6123693379790941 };
  const orientation = getRayOrientation(camera, clickedPoint.x, clickedPoint.y);
  const projectedPoint = projectOrientation(camera, orientation);

  assert.ok(Math.abs(projectedPoint.x - clickedPoint.x) < 1e-10);
  assert.ok(Math.abs(projectedPoint.y - clickedPoint.y) < 1e-10);
});

test("selecting a panorama comment centers its saved point", () => {
  const savedSelection = {
    yaw: -64.15472910317654,
    pitch: 9.259579050454457,
    viewerPoint: {
      modelPosition: {
        x: -444.1237324113215,
        y: 80.45378765058359,
        z: -215.13088658235895,
      },
    },
  };
  const orientation = getPanoramaOrientation(savedSelection);
  const camera = createPanoramaCamera({
    aspect: 1379 / 916,
    fieldOfView: 55,
    ...orientation,
  });
  const projectedPoint = projectOrientation(camera, orientation);

  assert.ok(Math.abs(projectedPoint.x - 0.5) < 1e-10);
  assert.ok(Math.abs(projectedPoint.y - 0.5) < 1e-10);
});
