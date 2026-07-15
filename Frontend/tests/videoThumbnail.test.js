import assert from "node:assert/strict";
import test from "node:test";

import { getVideoThumbnailTime } from "../src/utils/videoThumbnail.js";

test("video thumbnail chooses a representative early frame", () => {
  assert.equal(getVideoThumbnailTime(100), 5);
  assert.equal(getVideoThumbnailTime(20), 2);
  assert.equal(getVideoThumbnailTime(0.1), 0.05);
  assert.equal(getVideoThumbnailTime(0), 0);
});
