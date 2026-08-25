import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessObservations,
  getEnvironmentNotificationsPolicy,
  isAdministrator,
} from "../src/utils/observationAccess.js";

test("administrators always receive an activity-only environment drawer", () => {
  assert.equal(canAccessObservations({ roleCode: "admin" }), false);
  assert.equal(isAdministrator({ role: "admin" }), true);
  assert.equal(canAccessObservations({ role: "admin" }), false);
  assert.equal(canAccessObservations({ role: { code: "admin" } }), false);
  assert.equal(
    canAccessObservations({ roleDetails: { code: "ADMIN" } }),
    false,
  );
  assert.deepEqual(
    getEnvironmentNotificationsPolicy({ role: "ADMIN" }),
    {
      activityOnly: true,
      observationsAllowed: false,
    },
  );
});

test("client and architect drawers retain observations unless activity-only is requested", () => {
  assert.equal(canAccessObservations({ roleCode: "client" }), true);
  assert.equal(canAccessObservations({ roleCode: "architect" }), true);
  assert.deepEqual(
    getEnvironmentNotificationsPolicy("architect", { activityOnly: true }),
    {
      activityOnly: true,
      observationsAllowed: false,
    },
  );
});
