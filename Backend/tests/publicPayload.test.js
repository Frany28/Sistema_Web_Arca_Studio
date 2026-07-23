import assert from "node:assert/strict";
import test from "node:test";

import { sanitizePublicPayload } from "../src/utils/publicPayload.js";

test("public payloads remove private storage and protected endpoint links", () => {
  const timestamp = new Date("2026-07-22T12:00:00.000Z");
  assert.deepEqual(
    sanitizePublicPayload({
      createdAt: timestamp,
      externalReference: "https://unapproved.example/resource",
      referenceLink: "https://figma.com/design/example",
      file_url: "https://project.supabase.co/storage/v1/object/public/files/a.png",
      cover: "https://unknown-storage.example/private/files/a.png",
      image: "https://app.example/api/projects/1/files/4/content",
      nested: {
        endpoint: "/api/private-resource",
        profilePhotoUrl: "https://private.example/avatar.jpg",
        safeId: 4,
        src: "/api/projects/1/files/4/content",
      },
      architectAvatar: "/api/projects/1/assigned-architect/profile-photo",
      commentAuthorAvatar: "/api/projects/1/comment-authors/2/profile-photo",
      preview: "s3://private-bucket/projects/1/file.png",
    }),
    {
      createdAt: timestamp,
      referenceLink: "https://figma.com/design/example",
      nested: { safeId: 4 },
    },
  );
});

test("only explicitly allowlisted business links survive public payloads", () => {
  assert.deepEqual(
    sanitizePublicPayload({
      documentation: "https://example.com/docs",
      referenceLink: "https://example.com/inspiration",
      referenceLinks: [
        "https://example.com/one",
        "https://example.com/two",
      ],
    }),
    {
      referenceLink: "https://example.com/inspiration",
    },
  );
});

test("public payload sanitizer preserves ordinary values and nulls", () => {
  assert.deepEqual(
    sanitizePublicPayload({
      emptyValues: [],
      image: null,
      title: "Proyecto",
      values: [1, null, "ok"],
    }),
    { emptyValues: [], image: null, title: "Proyecto", values: [1, null, "ok"] },
  );
});
