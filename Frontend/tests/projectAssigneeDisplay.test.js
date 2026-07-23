import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAssignedArchitectAvatarUrl,
  getInitialsFromDisplayName,
  getProjectAssigneeAvatar,
} from "../src/utils/projectAssigneeDisplay.js";

test("assigned architect avatar uses real identity and authenticated project URL", () => {
  const avatar = getProjectAssigneeAvatar({
    id: 12,
    assignedArchitect: {
      hasProfilePhoto: true,
      name: "Ana Contreras",
    },
  });

  assert.equal(avatar.name, "Ana Contreras");
  assert.equal(avatar.initials, "AC");
  assert.equal(avatar.src, "/api/projects/12/assigned-architect/profile-photo");
  assert.equal(avatar.decorative, false);
});

test("assigned architect avatar falls back to initials without a stored photo", () => {
  const project = { id: 12, assignedArchitect: { name: "Laura", hasProfilePhoto: false } };
  const avatar = getProjectAssigneeAvatar(project);

  assert.equal(avatar.initials, "LA");
  assert.equal(avatar.src, "");
  assert.equal(buildAssignedArchitectAvatarUrl(project), "");
  assert.equal(getInitialsFromDisplayName("María Elena Pérez"), "MP");
});

test("projects without an assigned architect do not create a placeholder avatar", () => {
  assert.equal(getProjectAssigneeAvatar({ id: 12 }), null);
});
