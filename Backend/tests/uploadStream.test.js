import assert from "node:assert/strict";
import test from "node:test";
import { getUploadStream } from "../src/utils/uploadStream.js";

test("upload stream uses the request without buffering", () => {
  const request = { headers: { "content-length": "1024" } };
  assert.deepEqual(getUploadStream(request, 2048), { body: request, size: 1024 });
});

test("upload stream rejects missing and oversized lengths", () => {
  assert.throws(() => getUploadStream({ headers: {} }, 100), { code: "FILE_LENGTH_REQUIRED", status: 411 });
  assert.throws(() => getUploadStream({ headers: { "content-length": "101" } }, 100), { code: "FILE_TOO_LARGE", status: 413 });
});
