import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/hooks/useScrollDirectionVisibility.js", import.meta.url),
  "utf8",
);

function createHarness({ reducedMotion = false } = {}) {
  const effects = [];
  const triggers = [];
  const calls = [];
  const animation = {
    progress() { return this; },
    play() { calls.push("show"); },
    reverse() { calls.push("hide"); },
  };
  const window = { getComputedStyle: () => ({ overflowY: "hidden" }) };
  const document = { body: {} };
  const gsap = {
    registerPlugin() {},
    set() { calls.push("reset"); },
    from() { return animation; },
    context(callback) {
      callback();
      return { revert() { calls.push("cleanup"); } };
    },
  };
  const ScrollTrigger = { create(options) { triggers.push(options); } };
  const loadHook = new Function(
    "useEffect", "useLayoutEffect", "gsap", "ScrollTrigger",
    "useReducedMotion", "window", "document",
    source.replace(/^import .*;\r?\n/gm, "")
      .replace(/export \{[\s\S]*?\};/, "")
      .replace("export default useScrollDirectionVisibility;", "return useScrollDirectionVisibility;"),
  );
  const hook = loadHook(
    (effect) => effects.push(effect),
    (effect) => effect(),
    gsap, ScrollTrigger, () => reducedMotion, window, document,
  );
  return { calls, effects, hook, triggers, window };
}

test("navbar waits for the ancestor ref and follows Home's own scroll in both directions", () => {
  const harness = createHarness();
  const scrollContainerRef = { current: null };
  harness.hook({ current: {} }, { scrollContainerRef });
  assert.equal(harness.triggers.length, 0);

  // La ref del ancestro se asigna después de los efectos de layout del hijo.
  const homeScroller = {};
  scrollContainerRef.current = homeScroller;
  const cleanup = harness.effects[0]();
  const trigger = harness.triggers[0];
  assert.equal(trigger.scroller, homeScroller);
  assert.equal(trigger.start, 0);
  assert.equal(trigger.end, "max");
  trigger.onUpdate({ scroll: () => 500, direction: 1 });
  trigger.onUpdate({ scroll: () => 450, direction: -1 });
  trigger.onUpdate({ scroll: () => 0, direction: 1 });
  cleanup();
  assert.deepEqual(harness.calls, ["hide", "show", "show", "cleanup"]);
});

test("navbar preserves window scrolling when there is no nested scroller", () => {
  const harness = createHarness();
  harness.hook({ current: {} });
  harness.effects[0]();
  assert.equal(harness.triggers[0].scroller, undefined);
});

test("reduced motion keeps the navbar visible without a scroll animation", () => {
  const harness = createHarness({ reducedMotion: true });
  harness.hook({ current: {} });
  harness.effects[0]();
  assert.equal(harness.triggers.length, 0);
  assert.deepEqual(harness.calls, ["reset"]);
});
