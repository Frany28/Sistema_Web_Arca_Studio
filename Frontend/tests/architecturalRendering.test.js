import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyArchitecturalMaterial,
  getStableMaterialKey,
} from "../src/utils/architecturalRendering.js";

test("architectural materials classify common Spanish and English names", () => {
  assert.equal(classifyArchitecturalMaterial("Vidrio fachada"), "glass");
  assert.equal(classifyArchitecturalMaterial("Aluminum frame"), "metal");
  assert.equal(classifyArchitecturalMaterial("LED Sign"), "emissive");
  assert.equal(classifyArchitecturalMaterial("Plant leaves"), "vegetation");
  assert.equal(classifyArchitecturalMaterial("Concrete wall"), "opaque");
});

test("material keys remain stable and bounded by authored names", () => {
  assert.equal(getStableMaterialKey({ name: "Wall" }, 4), "4:Wall");
  assert.equal(getStableMaterialKey({}, 2), "2:material");
  assert.ok(
    getStableMaterialKey({ name: "x".repeat(300) }, 1).length <= 122,
  );
});
