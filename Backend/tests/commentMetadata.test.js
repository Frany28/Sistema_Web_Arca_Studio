import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeCommentMetadata } from "../src/utils/commentMetadata.js";

test("comment metadata never exposes nested resource links", () => {
  assert.deepEqual(
    sanitizeCommentMetadata({
      image: {
        id: "project-file-4",
        src: "https://example.com/api/projects/1/files/4/content",
        title: "Plano.png",
      },
      imageSrc: "/api/projects/1/files/4/content",
      legacyStorage: "s3://private-bucket/projects/1/file.png",
      selection: {
        image: {
          id: "project-file-4",
          url: "https://example.com/file",
        },
        preview: "https://project.supabase.co/storage/v1/object/public/files/a.png",
        x: 10,
      },
    }),
    {
      image: { id: "project-file-4", title: "Plano.png" },
      selection: { image: { id: "project-file-4" }, x: 10 },
    },
  );
});
