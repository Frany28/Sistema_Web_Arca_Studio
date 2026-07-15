import assert from "node:assert/strict";
import test from "node:test";

import { getModel3DSource } from "../src/utils/model3DThumbnail.js";

test("model thumbnail resolves the real model source", () => {
  assert.equal(getModel3DSource({ modelUrl: "model.glb", fileUrl: "file.glb" }), "model.glb");
  assert.equal(getModel3DSource({ fileUrl: "file.glb" }), "file.glb");
  assert.equal(getModel3DSource({}), "");
});
