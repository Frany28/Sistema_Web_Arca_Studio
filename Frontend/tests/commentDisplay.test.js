import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCommentAuthorAvatarUrl,
  decorateCommentForDisplay,
  getCommentableProjectsForUser,
  getObservationTypeLabel,
  getProjectNamesById,
  orderCommentsByThread,
} from "../src/utils/commentDisplay.js";

const projects = [
  {
    id: 1,
    name: "Residencia Norte",
    client: { id: 10 },
    assignedArchitect: { id: 20 },
    isPublic: false,
  },
  {
    id: 2,
    name: "Proyecto público",
    client: { id: 11 },
    assignedArchitect: { id: 21 },
    isPublic: true,
  },
];

test("commentable projects follow participant roles and ignore public visibility", () => {
  assert.deepEqual(
    getCommentableProjectsForUser(projects, { role: "client", clientId: 10 }).map(({ id }) => id),
    [1],
  );
  assert.deepEqual(
    getCommentableProjectsForUser(projects, { role: "architect", id: 20 }).map(({ id }) => id),
    [1],
  );
  assert.deepEqual(
    getCommentableProjectsForUser(projects, { role: "admin" }).map(({ id }) => id),
    [1, 2],
  );
  assert.deepEqual(getCommentableProjectsForUser(projects, { role: "support" }), []);
});

test("observation types use the standardized professional vocabulary", () => {
  assert.equal(getObservationTypeLabel("general"), "Observación general");
  assert.equal(getObservationTypeLabel("image"), "Observación sobre imagen");
  assert.equal(getObservationTypeLabel("video"), "Observación sobre video");
  assert.equal(getObservationTypeLabel("panorama"), "Observación en panorámica 360");
});

test("display decoration includes current author, role, avatar and project", () => {
  const user = {
    id: 20,
    role: "architect",
    profilePhotoUrl: "authenticated-avatar",
  };
  const comment = {
    author: { id: 20, name: "Ana Pérez", roleCode: "architect" },
    commentType: "image",
    projectId: 1,
  };
  const decorated = decorateCommentForDisplay(
    comment,
    user,
    getProjectNamesById(projects),
  );

  assert.equal(decorated.name, "Tú");
  assert.equal(decorated.authorRoleLabel, "Arquitecto");
  assert.equal(decorated.avatarSrc, "authenticated-avatar");
  assert.equal(decorated.projectName, "Residencia Norte");
  assert.equal(decorated.observationTypeLabel, "Observación sobre imagen");
});

test("other authors use the authenticated project avatar endpoint", () => {
  const decorated = decorateCommentForDisplay(
    {
      author: {
        id: 30,
        name: "María Gómez",
        hasProfilePhoto: true,
        roleCode: "client",
      },
      commentType: "general",
      projectId: 1,
    },
    { id: 20, role: "architect" },
    getProjectNamesById(projects),
  );

  assert.equal(decorated.name, "María Gómez");
  assert.equal(decorated.authorRoleLabel, "Cliente");
  assert.equal(
    decorated.avatarSrc,
    "/api/projects/1/comment-authors/30/profile-photo",
  );
});

test("current authors fall back to the authenticated comment avatar endpoint", () => {
  const decorated = decorateCommentForDisplay(
    {
      author: {
        id: 20,
        name: "Ana Pérez",
        hasProfilePhoto: true,
        roleCode: "architect",
      },
      commentType: "document",
      projectId: 1,
    },
    { id: 20, role: "architect", hasProfilePhoto: true },
  );

  assert.equal(
    decorated.avatarSrc,
    "/api/projects/1/comment-authors/20/profile-photo",
  );
});

test("shared environment observations use their authenticated avatar endpoint", () => {
  const decorated = decorateCommentForDisplay(
    {
      author: {
        id: 30,
        name: "María Gómez",
        hasProfilePhoto: true,
        roleCode: "client",
      },
      commentType: "general",
      projectId: null,
      scope: "environment",
    },
    { id: 20, role: "architect" },
  );

  assert.equal(
    decorated.avatarSrc,
    "/api/environment-comments/authors/30/profile-photo",
  );
  assert.equal(decorated.projectName, "");
});

test("author avatar endpoint requires a stored photo and valid identifiers", () => {
  assert.equal(
    buildCommentAuthorAvatarUrl({
      author: { id: 30, hasProfilePhoto: true },
      projectId: 1,
    }),
    "/api/projects/1/comment-authors/30/profile-photo",
  );
  assert.equal(
    buildCommentAuthorAvatarUrl({ author: { id: 30 }, projectId: 1 }),
    "",
  );
  assert.equal(
    buildCommentAuthorAvatarUrl({
      author: { id: 30, hasProfilePhoto: true },
    }),
    "",
  );
});

test("author avatar endpoint relies on the HttpOnly session cookie", () => {
  assert.equal(
    buildCommentAuthorAvatarUrl({
      author: { id: 30, hasProfilePhoto: true },
      projectId: 1,
    }),
    "/api/projects/1/comment-authors/30/profile-photo",
  );
});

test("general comments show the three newest root comments first", () => {
  const comments = [
    { id: "first", createdAt: "2026-07-10T10:00:00Z" },
    { id: "second", createdAt: "2026-07-11T10:00:00Z" },
    { id: "third", createdAt: "2026-07-12T10:00:00Z" },
    { id: "fourth", createdAt: "2026-07-13T10:00:00Z" },
  ];

  assert.deepEqual(
    orderCommentsByThread(comments, { limitRootThreads: 3 }).map(({ id }) => id),
    ["fourth", "third", "second"],
  );
});

test("a recent reply stays with its root without changing root comment order", () => {
  const comments = [
    { id: "old-root", createdAt: "2026-07-01T10:00:00Z" },
    {
      id: "old-reply",
      parentCommentId: "old-root",
      createdAt: "2026-07-15T10:00:00Z",
    },
    { id: "root-2", createdAt: "2026-07-14T10:00:00Z" },
    { id: "root-3", createdAt: "2026-07-13T10:00:00Z" },
    { id: "root-4", createdAt: "2026-07-12T10:00:00Z" },
  ];

  assert.deepEqual(
    orderCommentsByThread(comments, { limitRootThreads: 3 }).map(({ id }) => id),
    ["root-2", "root-3", "root-4"],
  );
});

test("replies remain below their root from oldest to newest", () => {
  const comments = [
    { id: "new-root", createdAt: "2026-07-15T10:00:00Z" },
    {
      id: "newer-reply",
      parentCommentId: "new-root",
      createdAt: "2026-07-15T12:00:00Z",
    },
    {
      id: "older-reply",
      parentCommentId: "new-root",
      createdAt: "2026-07-15T11:00:00Z",
    },
    { id: "old-root", createdAt: "2026-07-14T10:00:00Z" },
  ];

  assert.deepEqual(
    orderCommentsByThread(comments).map(({ id }) => id),
    ["new-root", "older-reply", "newer-reply", "old-root"],
  );
});
