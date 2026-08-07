import assert from "node:assert/strict";
import test from "node:test";

import { getProjectFileCacheHeaders } from "../src/utils/projectFileCache.js";

test("current version project media uses a private immutable cache", () => {
  assert.deepEqual(
    getProjectFileCacheHeaders({
      currentVersionId: 9,
      fileId: 4,
      requestedVersionId: 9,
    }),
    {
      cacheControl: "private, max-age=31536000, immutable",
      etag: '"project-file-4-version-9"',
    },
  );
});

test("unversioned or stale project media keeps the short fallback cache", () => {
  assert.equal(
    getProjectFileCacheHeaders({
      currentVersionId: 9,
      fileId: 4,
      requestedVersionId: null,
    }).cacheControl,
    "private, max-age=300",
  );
  assert.equal(
    getProjectFileCacheHeaders({
      currentVersionId: 9,
      fileId: 4,
      requestedVersionId: 8,
    }).cacheControl,
    "private, max-age=300",
  );
});
