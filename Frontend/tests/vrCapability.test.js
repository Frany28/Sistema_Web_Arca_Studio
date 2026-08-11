import assert from "node:assert/strict";
import test from "node:test";

import {
  getVrSupportStatus,
  isHandheldMobileNavigator,
  requestVrSession,
} from "../src/hooks/useVrViewerLaunch.js";

test("VR support distinguishes compatible and fallback browsers", async () => {
  assert.equal(await getVrSupportStatus(undefined), "unsupported");
  assert.equal(await getVrSupportStatus({ isSessionSupported: async () => false }), "unsupported");
  assert.equal(await getVrSupportStatus({ isSessionSupported: async () => true }), "supported");
  assert.equal(await getVrSupportStatus({ isSessionSupported: async () => { throw new Error("blocked"); } }), "unsupported");
});

test("handheld mobile devices use the single-view panorama instead of split-screen VR", async () => {
  const mobileNavigator = {
    userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit Mobile",
    userAgentData: { mobile: true },
  };
  let supportCheckCalled = false;
  const xr = {
    isSessionSupported: async () => {
      supportCheckCalled = true;
      return true;
    },
  };

  assert.equal(isHandheldMobileNavigator(mobileNavigator), true);
  assert.equal(await getVrSupportStatus(xr, mobileNavigator), "unsupported");
  assert.equal(supportCheckCalled, false);
});

test("dedicated headset browsers keep immersive WebXR enabled", async () => {
  const headsetNavigator = {
    userAgent: "Mozilla/5.0 (Linux; Android 12; Quest 3) OculusBrowser/37.0 Mobile VR",
    userAgentData: { mobile: true },
  };

  assert.equal(isHandheldMobileNavigator(headsetNavigator), false);
  assert.equal(
    await getVrSupportStatus({ isSessionSupported: async () => true }, headsetNavigator),
    "supported",
  );
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
