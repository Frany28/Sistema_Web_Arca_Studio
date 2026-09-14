import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createFakeClock } from "./helpers/fakeClock.js";
import {
  SECTION_NAVIGATION_DURATION_SECONDS,
  SECTION_NAVIGATION_EASE,
} from "../src/pages/publicSite/utils/sectionNavigationMotion.js";

function loadHook(dependencies) {
  const source = readFileSync(
    new URL(
      "../src/pages/publicSite/featuredProjects/hooks/useFeaturedProjectsPanelLoop.js",
      import.meta.url,
    ),
    "utf8",
  )
    .replace(/import[^;]+;\s*/g, "")
    .replace(/export default .*;/g, "");

  return new Function(
    ...Object.keys(dependencies),
    `${source}\nreturn useFeaturedProjectsPanelLoop;`,
  )(...Object.values(dependencies));
}

function setup(reduceMotion = false) {
  const clock = createFakeClock();
  const effects = [];
  const handlers = {};
  const states = [];
  const timelines = [];
  const panels = [{}, {}];
  const sectionTop = 1000;
  const sectionHeight = 1400;
  const viewportHeight = 800;
  const scroller = {
    clientHeight: viewportHeight,
    scrollTop: sectionTop + sectionHeight - viewportHeight,
    getBoundingClientRect() {
      return { top: 0, bottom: viewportHeight, height: viewportHeight };
    },
  };
  const stage = {
    closest: () => scroller,
    getBoundingClientRect() {
      const top = sectionTop - scroller.scrollTop;
      return { top, bottom: top + sectionHeight, height: sectionHeight };
    },
    addEventListener(type, handler) {
      handlers[type] = handler;
    },
    removeEventListener(type) {
      delete handlers[type];
    },
  };
  const window = {
    clearTimeout: clock.clearTimeout,
    innerHeight: viewportHeight,
    scrollY: 0,
    setTimeout: clock.setTimeout,
  };
  const gsap = {
    killTweensOf() {},
    set(target, values) {
      if (!Array.isArray(target)) Object.assign(target, values);
    },
    timeline(options) {
      const timeline = {
        kill() {},
        options,
        to() {
          return timeline;
        },
        complete() {
          options.onComplete?.();
        },
      };
      timelines.push(timeline);
      return timeline;
    },
    utils: {
      toArray: () => panels,
      wrap(minimum, maximum, value) {
        return ((value - minimum) % (maximum - minimum) + (maximum - minimum))
          % (maximum - minimum) + minimum;
      },
    },
  };
  const renderPanelLoop = loadHook({
    SECTION_NAVIGATION_DURATION_SECONDS,
    SECTION_NAVIGATION_EASE,
    gsap,
    window,
    useLayoutEffect: (effect) => effects.push(effect),
    useReducedMotion: () => reduceMotion,
    useRef: (current) => ({ current }),
    useState(initial) {
      const index = states.length;
      states.push(initial);
      return [initial, (value) => {
        states[index] = typeof value === "function" ? value(states[index]) : value;
      }];
    },
  });
  const activeIndex = renderPanelLoop({ current: stage }, true);
  const cleanup = effects[0]();

  return {
    activeIndex,
    cleanup,
    clock,
    getActiveIndex: () => states[0],
    handlers,
    scroller,
    sectionTop,
    timelines,
  };
}

function createWheelEvent(deltaY = 60) {
  let prevented = false;
  let stopped = false;

  return {
    deltaX: 0,
    deltaY,
    preventDefault() {
      prevented = true;
    },
    stopPropagation() {
      stopped = true;
    },
    wasConsumed: () => prevented && stopped,
  };
}

test("one inertial wheel gesture changes the featured project only once", () => {
  const app = setup();
  const firstEvent = createWheelEvent();
  app.handlers.wheel(firstEvent);

  assert.equal(firstEvent.wasConsumed(), true);
  assert.equal(app.getActiveIndex(), 1);
  assert.equal(app.timelines.length, 1);
  assert.equal(
    app.timelines[0].options.defaults.duration,
    SECTION_NAVIGATION_DURATION_SECONDS,
  );
  assert.equal(app.timelines[0].options.defaults.ease, SECTION_NAVIGATION_EASE);

  const eventDuringTransition = createWheelEvent();
  app.handlers.wheel(eventDuringTransition);
  app.timelines[0].complete();
  app.handlers.wheel(createWheelEvent());

  assert.equal(eventDuringTransition.wasConsumed(), true);
  assert.equal(app.getActiveIndex(), 1);
  assert.equal(app.timelines.length, 1);

  app.clock.advance(180);
  app.scroller.scrollTop = app.sectionTop + 600;
  app.handlers.wheel(createWheelEvent());

  assert.equal(app.getActiveIndex(), 0);
  assert.equal(app.timelines.length, 2);
  app.cleanup();
  assert.equal(app.clock.pending(), 0);
});

test("reduced motion also consumes only one transition per wheel gesture", () => {
  const app = setup(true);

  app.handlers.wheel(createWheelEvent());
  app.handlers.wheel(createWheelEvent());
  assert.equal(app.getActiveIndex(), 1);

  app.clock.advance(180);
  app.handlers.wheel(createWheelEvent(-60));
  assert.equal(app.getActiveIndex(), 0);
  app.cleanup();
});

test("leaving featured projects resets the cycle before re-entry", () => {
  const sectionSource = readFileSync(
    new URL(
      "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsSection.jsx",
      import.meta.url,
    ),
    "utf8",
  );
  const openingHomeSource = readFileSync(
    new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
    "utf8",
  );
  const hookSource = readFileSync(
    new URL(
      "../src/pages/publicSite/featuredProjects/hooks/useFeaturedProjectsPanelLoop.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    openingHomeSource,
    /active=\{activeSectionId === "featured-projects"\}/,
  );
  assert.match(sectionSource, /active && step === 2/);
  assert.match(
    hookSource,
    /if \(!enabled\) \{[\s\S]*activeIndexRef\.current = 0/,
  );
});

test("the active project must be fully traversed before changing panels", () => {
  const app = setup();
  app.scroller.scrollTop = app.sectionTop + 200;

  const middleEvent = createWheelEvent();
  app.handlers.wheel(middleEvent);
  assert.equal(middleEvent.wasConsumed(), false);
  assert.equal(app.getActiveIndex(), 0);
  assert.equal(app.timelines.length, 0);

  app.scroller.scrollTop = app.sectionTop + 600;
  const boundaryEvent = createWheelEvent();
  app.handlers.wheel(boundaryEvent);
  assert.equal(boundaryEvent.wasConsumed(), true);
  assert.equal(app.getActiveIndex(), 1);
  app.timelines[0].complete();
  assert.equal(app.scroller.scrollTop, app.sectionTop);

  app.clock.advance(180);
  const newProjectEvent = createWheelEvent();
  app.handlers.wheel(newProjectEvent);
  assert.equal(newProjectEvent.wasConsumed(), false);
  assert.equal(app.getActiveIndex(), 1);
  app.cleanup();
});
