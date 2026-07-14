import assert from "node:assert/strict";
import test from "node:test";

import {
  decorateCommentForDisplay,
  getCommentableProjectsForUser,
  getObservationTypeLabel,
  getProjectNamesById,
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

test("other authors keep their full name, role and stored avatar", () => {
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
  assert.equal(decorated.avatarSrc, "client-avatar");
});
