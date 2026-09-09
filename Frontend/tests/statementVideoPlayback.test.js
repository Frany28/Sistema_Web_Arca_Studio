import assert from "node:assert/strict";
import test from "node:test";
import { connectStatementPlayback } from "../src/pages/publicSite/home/utils/statementVideoPlayback.js";

function setup() {
  const videoEvents = {};
  const documentEvents = {};
  const calls = [];
  const video = {
    currentTime: 12,
    play() { calls.push("play"); return Promise.resolve(); },
    pause() { calls.push("pause"); },
    addEventListener(type, fn) { videoEvents[type] = fn; },
    removeEventListener(type) { delete videoEvents[type]; },
  };
  const documentTarget = {
    hidden: false,
    addEventListener(type, fn) { documentEvents[type] = fn; },
    removeEventListener(type) { delete documentEvents[type]; },
  };
  return { video, videoEvents, documentTarget, documentEvents, calls };
}

for (const [active, enabled, playing] of [[false, true, true], [true, false, true], [true, true, false]]) {
  test(`video remains paused when active=${active}, enabled=${enabled}, playing=${playing}`, () => {
    const app = setup();
    const cleanup = connectStatementPlayback(app.video, { active, enabled, playing, documentTarget: app.documentTarget });
    app.videoEvents.canplay();
    app.documentEvents.visibilitychange();
    assert.ok(app.calls.every((call) => call === "pause"));
    assert.equal(app.video.currentTime, 12);
    cleanup();
  });
}

test("video pauses in a hidden tab, resumes muted and removes all subscriptions", () => {
  const app = setup();
  const cleanup = connectStatementPlayback(app.video, { active: true, enabled: true, playing: true, documentTarget: app.documentTarget });
  assert.equal(app.video.muted, true);
  app.documentTarget.hidden = true;
  app.documentEvents.visibilitychange();
  app.documentTarget.hidden = false;
  app.documentEvents.visibilitychange();
  assert.deepEqual(app.calls, ["play", "pause", "play"]);
  cleanup();
  assert.deepEqual(app.videoEvents, {});
  assert.deepEqual(app.documentEvents, {});
});

test("autoplay rejection is handled without an unhandled promise", async () => {
  const app = setup();
  app.video.play = () => Promise.reject(new Error("Autoplay blocked"));
  const cleanup = connectStatementPlayback(app.video, { active: true, enabled: true, playing: true, documentTarget: app.documentTarget });
  await Promise.resolve();
  cleanup();
});
