import assert from "node:assert/strict";
import test from "node:test";

import { getCommentNavigationParams, getToggledCommentId } from "../src/utils/commentSelection.js";

test("shared comment selection focuses a different comment", () => {
  assert.equal(getToggledCommentId(10, 20), 20);
});

test("shared comment navigation routes documents to their file and comment", () => {
  assert.equal(
    getCommentNavigationParams({ commentType: "document", fileId: 7, id: 20 }).toString(),
    "tab=documents&fileId=7&commentId=20",
  );
});

test("shared comment selection clears the currently focused comment", () => {
  assert.equal(getToggledCommentId(20, 20), null);
  assert.equal(getToggledCommentId("20", 20), null);
});
