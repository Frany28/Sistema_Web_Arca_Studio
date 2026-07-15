import assert from "node:assert/strict";
import test from "node:test";

import { setAuthToken } from "../src/api/http.js";
import {
  buildAssignedArchitectAvatarUrl,
  getInitialsFromDisplayName,
  getProjectAssigneeAvatar,
} from "../src/utils/projectAssigneeDisplay.js";

test("assigned architect avatar uses real identity and authenticated project URL", () => {
  setAuthToken("avatar token");
  const avatar = getProjectAssigneeAvatar({
    id: 12,
    assignedArchitect: {
      email: "ana@example.com",
      name: "Ana Contreras",
      profilePhotoUrl: "stored-photo",
    },
  });

  assert.equal(avatar.name, "Ana Contreras");
  assert.equal(avatar.initials, "AC");
  assert.equal(avatar.src, "/api/projects/12/assigned-architect/profile-photo?access_token=avatar+token");
  assert.equal(avatar.decorative, false);
  setAuthToken(null);
});

test("assigned architect avatar falls back to initials without a stored photo", () => {
  const project = { id: 12, assignedArchitect: { name: "Laura", profilePhotoUrl: null } };
  const avatar = getProjectAssigneeAvatar(project);

  assert.equal(avatar.initials, "LA");
  assert.equal(avatar.src, "");
  assert.equal(buildAssignedArchitectAvatarUrl(project), "");
  assert.equal(getInitialsFromDisplayName("María Elena Pérez"), "MP");
});

test("projects without an assigned architect do not create a placeholder avatar", () => {
  assert.equal(getProjectAssigneeAvatar({ id: 12 }), null);
});
