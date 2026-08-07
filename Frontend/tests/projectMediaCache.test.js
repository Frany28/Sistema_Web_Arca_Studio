import assert from "node:assert/strict";
import test from "node:test";

import { api } from "../src/api/http.js";

test("project media content URLs include their immutable version key", () => {
  assert.match(
    api.projects.getFileContentUrl({
      fileId: 34,
      projectId: 12,
      versionId: 56,
    }),
    /\/api\/projects\/12\/files\/34\/content\?versionId=56$/,
  );
});

test("legacy media URLs remain compatible without a version key", () => {
  assert.match(
    api.projects.getFileContentUrl({ fileId: 34, projectId: 12 }),
    /\/api\/projects\/12\/files\/34\/content$/,
  );
});
