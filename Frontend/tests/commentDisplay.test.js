import assert from "node:assert/strict";
import test from "node:test";

import { setAuthToken } from "../src/api/http.js";
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
  assert.equal(getObservationTypeLabel("viewer3d"), "Observación en modelo 3D");
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
        profilePhotoUrl: "client-avatar",
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

test("author avatar endpoint requires a stored photo and valid identifiers", () => {
  assert.equal(
    buildCommentAuthorAvatarUrl({
      author: { id: 30, profilePhotoUrl: "stored-photo" },
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
      author: { id: 30, profilePhotoUrl: "stored-photo" },
    }),
    "",
  );
});

test("author avatar endpoint carries the current authentication token", () => {
  setAuthToken("token for image");

  assert.equal(
    buildCommentAuthorAvatarUrl({
      author: { id: 30, profilePhotoUrl: "stored-photo" },
      projectId: 1,
    }),
    "/api/projects/1/comment-authors/30/profile-photo?access_token=token+for+image",
  );

  setAuthToken(null);
});

test("general comments show only the three conversations with latest activity", () => {
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

test("a recent reply promotes its complete conversation and keeps replies together", () => {
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
    ["old-root", "old-reply", "root-2", "root-3"],
  );
});
