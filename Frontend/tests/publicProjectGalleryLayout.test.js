import assert from "node:assert/strict";
import test from "node:test";

import { getPublicGalleryColumnCount } from "../src/utils/publicProjectGalleryLayout.js";

test("public project gallery uses responsive column counts", () => {
  assert.equal(getPublicGalleryColumnCount(375), 1);
  assert.equal(getPublicGalleryColumnCount(767), 1);
  assert.equal(getPublicGalleryColumnCount(768), 2);
  assert.equal(getPublicGalleryColumnCount(1023), 2);
  assert.equal(getPublicGalleryColumnCount(1024), 2);
  assert.equal(getPublicGalleryColumnCount(1279), 2);
  assert.equal(getPublicGalleryColumnCount(1280), 3);
  assert.equal(getPublicGalleryColumnCount(1440), 3);
});
