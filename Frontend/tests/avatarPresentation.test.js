import assert from "node:assert/strict";
import test from "node:test";

import {
  getAvatarInitials,
  getAvatarPresentation,
} from "../src/utils/avatarPresentation.js";

test("internal users without photos use initials", () => {
  for (const roleCode of ["admin", "architect", "employee", "staff"]) {
    assert.deepEqual(
      getAvatarPresentation({
        identity: roleCode,
        name: "Andrea Salas",
        roleCode,
      }),
      {
        content: "Text",
        initials: "AS",
        src: "",
        theme: "Neutral",
      },
    );
  }
});

test("clients without photos use stable icon themes instead of initials", () => {
  const first = getAvatarPresentation({
    identity: 41,
    name: "Cliente Uno",
    roleCode: "client",
  });
  const repeated = getAvatarPresentation({
    identity: 41,
    name: "Cliente Uno",
    roleCode: "client",
  });

  assert.equal(first.content, "Icon");
  assert.equal(first.initials, "");
  assert.ok(["Brand 1", "Neutral"].includes(first.theme));
  assert.deepEqual(repeated, first);
});

test("real profile photos take precedence for every role", () => {
  const avatar = getAvatarPresentation({
    identity: 8,
    name: "Cliente Dos",
    roleCode: "client",
    src: "/profile-photo",
  });

  assert.equal(avatar.content, "Image");
  assert.equal(avatar.src, "/profile-photo");
  assert.equal(getAvatarInitials("María de León"), "ML");
});
