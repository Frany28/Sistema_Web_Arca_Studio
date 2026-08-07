import assert from "node:assert/strict";
import test from "node:test";

import { canShowPanoramaAnnotations } from "../src/utils/panoramaViewerState.js";

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
