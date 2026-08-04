import assert from "node:assert/strict";
import test from "node:test";

import { getVrSupportStatus, requestVrSession } from "../src/hooks/useVrViewerLaunch.js";

test("VR support distinguishes compatible and fallback browsers", async () => {
  assert.equal(await getVrSupportStatus(undefined), "unsupported");
  assert.equal(await getVrSupportStatus({ isSessionSupported: async () => false }), "unsupported");
  assert.equal(await getVrSupportStatus({ isSessionSupported: async () => true }), "supported");
  assert.equal(await getVrSupportStatus({ isSessionSupported: async () => { throw new Error("blocked"); } }), "unsupported");
});

test("VR session requests immersive mode with safe optional floor features", async () => {
  let request;
  const session = {};
  const result = await requestVrSession({
    requestSession: async (...args) => { request = args; return session; },
  });
  assert.equal(result, session);
  assert.equal(request[0], "immersive-vr");
  assert.deepEqual(request[1].optionalFeatures, ["local-floor", "bounded-floor"]);
});
