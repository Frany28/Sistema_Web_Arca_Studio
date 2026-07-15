import assert from "node:assert/strict";
import test from "node:test";

import {
  createVideoTimeSelection,
  formatVideoObservationTime,
  getVideoObservationTiming,
} from "../src/utils/videoObservation.js";

test("video observation time supports minutes and hours", () => {
  assert.equal(formatVideoObservationTime(0), "0:00");
  assert.equal(formatVideoObservationTime(84.9), "1:24");
  assert.equal(formatVideoObservationTime(3661), "1:01:01");
});

test("video selections retain decimal precision and normalize display fields", () => {
  const selection = createVideoTimeSelection(12.46, 60.04);

  assert.deepEqual(selection, {
    durationSeconds: 60,
    kind: "video-time",
    timeSeconds: 12.5,
  });
  assert.deepEqual(getVideoObservationTiming(selection), {
    videoDurationSeconds: 60,
    videoTimeLabel: "0:12",
    videoTimeSeconds: 12.5,
  });
});

test("invalid temporal selections are ignored", () => {
  assert.equal(createVideoTimeSelection(-1, 60), null);
  assert.equal(getVideoObservationTiming({ kind: "video-time", timeSeconds: 61, durationSeconds: 60 }), null);
  assert.equal(getVideoObservationTiming({ kind: "video-time", timeSeconds: "12", durationSeconds: 60 }), null);
});
