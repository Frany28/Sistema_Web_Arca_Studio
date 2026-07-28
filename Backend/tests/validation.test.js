import assert from "node:assert/strict";
import test from "node:test";
import { normalizeError, ValidationError } from "../src/errors/appError.js";
import {
  loginSchema,
  commentSchema,
  paginationSchema,
  projectCommentAuthorPhotoSchema,
  projectDetailSchema,
} from "../src/validation/schemas.js";

test("login schema normalizes email and rejects short passwords", () => {
  const valid = loginSchema.parse({ body: { email: " USER@EXAMPLE.COM ", password: "Password1!" } });
  assert.equal(valid.body.email, "user@example.com");
  assert.equal(loginSchema.safeParse({ body: { email: "bad", password: "short" } }).success, false);
});

test("pagination schema rejects invalid cursors and limits", () => {
  assert.equal(paginationSchema.safeParse({ query: { cursor: "broken", limit: 101 } }).success, false);
});

test("project detail schema accepts ids and slugs and validates file pagination", () => {
  assert.equal(
    projectDetailSchema.safeParse({
      params: { projectId: "12" },
      query: { filesLimit: "3" },
    }).success,
    true,
  );
  assert.equal(
    projectDetailSchema.safeParse({
      params: { projectId: "quinta-bella-vista" },
      query: {},
    }).success,
    true,
  );
  assert.equal(
    projectDetailSchema.safeParse({
      params: { projectId: "../private" },
      query: {},
    }).success,
    false,
  );
  assert.equal(
    projectDetailSchema.safeParse({
      params: { projectId: "12" },
      query: { filesLimit: 101 },
    }).success,
    false,
  );
});

test("comment author photo route accepts only positive project and user ids", () => {
  const valid = projectCommentAuthorPhotoSchema.parse({
    params: { projectId: "12", userId: "30" },
  });

  assert.deepEqual(valid.params, { projectId: 12, userId: 30 });
  assert.equal(
    projectCommentAuthorPhotoSchema.safeParse({
      params: { projectId: "12", userId: "0" },
    }).success,
    false,
  );
});

test("video observations validate their temporal selection", () => {
  const base = {
    params: { projectId: "12" },
    body: {
      commentType: "video",
      content: "Revisar este momento",
      targetId: "video-1",
    },
  };

  assert.equal(
    commentSchema.safeParse({
      ...base,
      body: {
        ...base.body,
        selection: { kind: "video-time", timeSeconds: 12.4, durationSeconds: 40 },
      },
    }).success,
    true,
  );
  assert.equal(
    commentSchema.safeParse({
      ...base,
      body: {
        ...base.body,
        selection: { kind: "video-time", timeSeconds: 41, durationSeconds: 40 },
      },
    }).success,
    false,
  );
  assert.equal(
    commentSchema.safeParse({
      ...base,
      body: {
        ...base.body,
        selection: { kind: "video-time", timeSeconds: "12", durationSeconds: 40 },
      },
    }).success,
    false,
  );
});

test("central errors preserve fields and hide unknown messages", () => {
  const validation = normalizeError(new ValidationError(undefined, { email: "Inválido" }));
  assert.deepEqual(validation.fields, { email: "Inválido" });
  assert.equal(normalizeError(new Error("database secret")).message, "Ocurrió un error inesperado.");
});

test("document observations require a normalized point within an existing page", () => {
  const base = {
    params: { projectId: "12" },
    body: {
      commentType: "document",
      content: "Revisar este punto",
      fileId: 10,
      fileVersionId: 20,
    },
  };
  const point = {
    kind: "document-point",
    pageCount: 4,
    pageNumber: 2,
    normalizedX: 0.25,
    normalizedY: 0.75,
  };
  assert.equal(commentSchema.safeParse({ ...base, body: { ...base.body, selection: point } }).success, true);
  assert.equal(commentSchema.safeParse({ ...base, body: { ...base.body, selection: { ...point, pageNumber: 5 } } }).success, false);
  assert.equal(commentSchema.safeParse({ ...base, body: { ...base.body, selection: { ...point, normalizedX: 1.1 } } }).success, false);
  assert.equal(commentSchema.safeParse({ ...base, body: { ...base.body, parentCommentId: 30, selection: null } }).success, true);
});
