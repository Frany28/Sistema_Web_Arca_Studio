import assert from "node:assert/strict";
import test from "node:test";

import { getProjectImageSource } from "../src/utils/projectImage.js";

test("project covers are reconstructed from protected identifiers", () => {
  assert.match(
    getProjectImageSource({ id: 12, imageFileId: 34 }),
    /\/api\/projects\/12\/files\/34\/content$/,
  );
});

test("local presentation images remain valid fallbacks", () => {
  assert.equal(
    getProjectImageSource({ image: "/assets/example.png" }),
    "/assets/example.png",
  );
  assert.equal(getProjectImageSource({ id: 12 }), null);
});
