import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createFakeClock } from "./helpers/fakeClock.js";

const showcaseSource = readFileSync(
  new URL(
    "../src/pages/publicSite/services/components/ServicesCategoryShowcase.jsx",
    import.meta.url,
  ),
  "utf8",
);
const homeSource = readFileSync(
  new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
  "utf8",
);

function setup({ categoryCount = 7, enabled = true, reducedMotion = false } = {}) {
  const clock = createFakeClock();
  const durations = [];
  const selected = [];
  const hookSlots = [];
  const tabs = Array.from({ length: categoryCount }, (_, index) => ({
    offsetHeight: 30,
    offsetTop: index * 50,
  }));
  const slides = Array.from({ length: categoryCount }, () => ({}));
  const indicator = {};
  const categories = Array.from({ length: categoryCount }, (_, index) => ({
    id: `category-${index}`,
  }));
  const section = {
    querySelectorAll: (selector) => selector.includes("role=") ? tabs : slides,
    querySelector: () => indicator,
  };
  const layout = {};
  let cleanup;
  let cursor = 0;
  let pendingEffect;

  const dependencies = {
    useLayoutEffect: (effect) => {
      pendingEffect = effect;
    },
    useRef: (initialValue) => {
      const slot = cursor;
      cursor += 1;
      hookSlots[slot] ??= { current: initialValue };
      return hookSlots[slot];
    },
    useState: (initialValue) => {
      const slot = cursor;
      cursor += 1;
      if (!(slot in hookSlots)) hookSlots[slot] = initialValue;
      const setValue = (nextValue) => {
        hookSlots[slot] = typeof nextValue === "function"
          ? nextValue(hookSlots[slot])
          : nextValue;
        selected.push(hookSlots[slot]);
      };
      return [hookSlots[slot], setValue];
    },
    useReducedMotion: () => reducedMotion,
    gsap: {
      to(_target, options) {
        durations.push(options.duration);
      },
      set() {},
      killTweensOf() {},
      context(callback) {
        callback();
        return { revert() {} };
      },
    },
    getComputedStyle: () => ({ lineHeight: "30" }),
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
    document: { fonts: { ready: Promise.resolve() } },
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
  };
  const source = readFileSync(
    new URL(
      "../src/pages/publicSite/services/hooks/useServicesCategoryScroll.js",
      import.meta.url,
    ),
    "utf8",
  )
    .replace(/import[^;]+;\s*/g, "")
    .replace(
      "export default useServicesCategoryScroll;",
      "return useServicesCategoryScroll;",
    );
  const hook = new Function(...Object.keys(dependencies), source)(
    ...Object.values(dependencies),
  );
  let api;

  const render = (isEnabled) => {
    cursor = 0;
    pendingEffect = undefined;
    api = hook(
      { current: section },
      { current: layout },
      categories,
      isEnabled,
    );
    cleanup?.();
    cleanup = pendingEffect?.();
    return api;
  };

  render(enabled);

  return {
    clock,
    durations,
    selected,
    get api() {
      return api;
    },
    render,
    cleanup: () => cleanup?.(),
  };
}

test("autoplay advances every two seconds in category order", () => {
  const app = setup();

  assert.equal(app.selected.at(-1), 0);
  assert.equal(app.clock.pending(), 1);
  app.clock.advance(1999);
  assert.equal(app.selected.at(-1), 0);
  app.clock.advance(1);
  assert.equal(app.selected.at(-1), 1);
  app.clock.advance(2000);
  assert.equal(app.selected.at(-1), 2);

  app.cleanup();
});

test("manual selection restarts the complete two-second delay", () => {
  const app = setup();

  app.clock.advance(2000);
  assert.equal(app.selected.at(-1), 1);
  app.clock.advance(1000);
  app.api.selectCategory(4);
  assert.equal(app.selected.at(-1), 4);
  assert.equal(app.clock.pending(), 1);
  app.clock.advance(1999);
  assert.equal(app.selected.at(-1), 4);
  app.clock.advance(1);
  assert.equal(app.selected.at(-1), 5);

  app.cleanup();
});

test("rapid manual selections keep exactly one autoplay timer", () => {
  const app = setup();

  app.api.selectCategory(1);
  app.api.selectCategory(4);
  app.api.selectCategory(2);
  assert.equal(app.selected.at(-1), 2);
  assert.equal(app.clock.pending(), 1);
  const selectionCount = app.selected.length;
  app.clock.advance(2000);
  assert.equal(app.selected.length, selectionCount + 1);
  assert.equal(app.selected.at(-1), 3);
  assert.equal(app.clock.pending(), 1);

  app.cleanup();
});

test("autoplay wraps from the final category to the first", () => {
  const app = setup();

  app.api.selectCategory(6);
  app.clock.advance(2000);
  assert.equal(app.selected.at(-1), 0);

  app.cleanup();
});

test("autoplay pauses while Services is inactive and resumes from its selection", () => {
  const app = setup();

  app.api.selectCategory(3);
  app.render(false);
  assert.equal(app.clock.pending(), 0);
  const pausedSelectionCount = app.selected.length;
  app.clock.advance(6000);
  assert.equal(app.selected.length, pausedSelectionCount);

  app.render(true);
  assert.equal(app.selected.at(-1), 3);
  assert.equal(app.clock.pending(), 1);
  app.clock.advance(2000);
  assert.equal(app.selected.at(-1), 4);

  app.cleanup();
});

test("cleanup removes autoplay and prevents updates after unmount", () => {
  const app = setup();
  const selectionCount = app.selected.length;

  app.cleanup();
  assert.equal(app.clock.pending(), 0);
  app.clock.advance(6000);
  assert.equal(app.selected.length, selectionCount);
});

test("category changes preserve GSAP crossfade and reduced motion", () => {
  const animated = setup();
  animated.api.selectCategory(1);
  assert.ok(animated.durations.slice(-8).every((duration) => duration === 0.2));
  animated.cleanup();

  const reduced = setup({ reducedMotion: true });
  reduced.api.selectCategory(1);
  reduced.clock.advance(2000);
  assert.ok(reduced.durations.every((duration) => duration === 0));
  reduced.cleanup();
});

test("Services registers no internal wheel or swipe navigation", () => {
  const hookSource = readFileSync(
    new URL(
      "../src/pages/publicSite/services/hooks/useServicesCategoryScroll.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.doesNotMatch(
    hookSource,
    /addEventListener|preventDefault|stopPropagation|advanceWheelGesture|normalizeWheelDelta|getSwipeDirection/,
  );
  assert.doesNotMatch(showcaseSource, /onMouseEnter|touch-pan-x/);
  assert.match(showcaseSource, /touch-auto/);
});

test("click and accessible keyboard navigation share selectCategory", () => {
  assert.match(showcaseSource, /onClick=\{\(\) => selectCategory\(index\)\}/);
  assert.match(showcaseSource, /selectCategory\(nextIndex\)/);
  assert.match(showcaseSource, /role="tab"/);
  assert.match(showcaseSource, /role="tabpanel"/);
  for (const key of [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ]) {
    assert.match(showcaseSource, new RegExp(`event\\.key === "${key}"`));
  }
});

test("OpeningHome activates autoplay through its existing section state", () => {
  assert.match(
    homeSource,
    /<ServicesSection\s+active=\{activeSectionId === "services"\}/,
  );
  assert.doesNotMatch(
    homeSource,
    /<ServicesSection[\s\S]*?onNextSection|<ServicesSection[\s\S]*?onPreviousSection/,
  );
});
