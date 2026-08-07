import assert from "node:assert/strict";
import test from "node:test";

import {
  canObservePanoramaViewer,
  canShowPanoramaAnnotations,
} from "../src/utils/panoramaViewerState.js";

test("panorama annotations stay hidden until the viewer is fully loaded", () => {
  assert.equal(
    canShowPanoramaAnnotations({
      isLoading: true,
      loadState: "loading",
      viewerLoaded: false,
      visible: true,
    }),
    false,
  );
  assert.equal(
    canShowPanoramaAnnotations({
      isLoading: true,
      loadState: "slow",
      viewerLoaded: false,
      visible: true,
    }),
    false,
  );
  assert.equal(
    canShowPanoramaAnnotations({
      isLoading: true,
      loadState: "error",
      viewerLoaded: false,
      visible: true,
    }),
    false,
  );
});

test("panorama annotations appear only after a successful visible load", () => {
  assert.equal(
    canShowPanoramaAnnotations({
      isLoading: false,
      loadState: "loaded",
      viewerLoaded: true,
      visible: true,
    }),
    true,
  );
  assert.equal(
    canShowPanoramaAnnotations({
      isLoading: false,
      loadState: "loaded",
      viewerLoaded: true,
      visible: false,
    }),
    false,
  );
});

test("a reopened panorama attaches its load lifecycle to the new viewer", () => {
  assert.equal(
    canObservePanoramaViewer({
      hasInteractiveModel: true,
      shouldRender: false,
      viewerAvailable: false,
      visible: false,
    }),
    false,
  );
  assert.equal(
    canObservePanoramaViewer({
      hasInteractiveModel: true,
      shouldRender: true,
      viewerAvailable: true,
      visible: true,
    }),
    true,
  );
});
