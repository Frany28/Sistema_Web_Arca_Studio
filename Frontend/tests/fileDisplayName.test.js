import assert from "node:assert/strict";
import test from "node:test";

import { getFileDisplayName } from "../src/utils/fileDisplayName.js";

test("file display names omit the final extension", () => {
  assert.equal(getFileDisplayName("Property 1=Variant2.png"), "Property 1=Variant2");
  assert.equal(getFileDisplayName("video.final.mp4"), "video.final");
  assert.equal(getFileDisplayName("Documento"), "Documento");
});

test("file display names preserve dotfiles and use a fallback", () => {
  assert.equal(getFileDisplayName(".env"), ".env");
  assert.equal(getFileDisplayName(""), "Archivo");
});
