import assert from "node:assert/strict";
import test from "node:test";

import { getToggledCommentId } from "../src/utils/commentSelection.js";

test("shared comment selection focuses a different comment", () => {
  assert.equal(getToggledCommentId(10, 20), 20);
});

test("shared comment selection clears the currently focused comment", () => {
  assert.equal(getToggledCommentId(20, 20), null);
  assert.equal(getToggledCommentId("20", 20), null);
});
