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
  const sectionTop = 1000;
  const panelHeight = 1400;
  const viewportHeight = 800;
  const scroller = {
    clientHeight: viewportHeight,
    scrollTop: sectionTop + panelHeight - viewportHeight,
    getBoundingClientRect() {
      return { top: 0, bottom: viewportHeight, height: viewportHeight };
    },
  };
  const panels = Array.from({ length: 3 }, (_, index) => ({
    getBoundingClientRect() {
      const top = sectionTop + (index * panelHeight) - scroller.scrollTop;
      return { top, bottom: top + panelHeight, height: panelHeight };
    },
  }));
  const stage = {
    closest: () => scroller,
    getBoundingClientRect() {
      const top = sectionTop - scroller.scrollTop;
      const height = panelHeight * panels.length;
      return { top, bottom: top + height, height };
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
        target: null,
        values: null,
        to(target, values) {
          timeline.target = target;
          timeline.values = values;
          return timeline;
        },
        complete() {
          if (timeline.target && timeline.values) {
            Object.assign(timeline.target, timeline.values);
          }
          options.onComplete?.();
        },
      };
      timelines.push(timeline);
      return timeline;
    },
    utils: { toArray: () => panels },
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
    getPanelEndScrollTop: (index) =>
      sectionTop + ((index + 1) * panelHeight) - viewportHeight,
    getPanelStartScrollTop: (index) => sectionTop + (index * panelHeight),
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
  app.scroller.scrollTop = app.getPanelEndScrollTop(1);
  app.handlers.wheel(createWheelEvent());

  assert.equal(app.getActiveIndex(), 2);
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
  app.scroller.scrollTop = app.getPanelStartScrollTop(1);
  app.handlers.wheel(createWheelEvent(-60));
  assert.equal(app.getActiveIndex(), 0);
  app.cleanup();
});

test("leaving featured projects resets the traversal before re-entry", () => {
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

test("Apto. JC is registered as the third featured-project panel", () => {
  const sectionSource = readFileSync(
    new URL(
      "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsSection.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(sectionSource, /APTO_JC_PROJECT/);
  assert.match(sectionSource, /activeProjectIndex === 2/);
  assert.match(sectionSource, /dark relative flex flex-col overflow-hidden/);
  assert.doesNotMatch(sectionSource, /relative grid overflow-hidden/);
});

test("the active project must be fully traversed before changing panels", () => {
  const app = setup();
  app.scroller.scrollTop = app.sectionTop + 200;

  const middleEvent = createWheelEvent();
  app.handlers.wheel(middleEvent);
  assert.equal(middleEvent.wasConsumed(), false);
  assert.equal(app.getActiveIndex(), 0);
  assert.equal(app.timelines.length, 0);

  app.scroller.scrollTop = app.getPanelEndScrollTop(0);
  const boundaryEvent = createWheelEvent();
  app.handlers.wheel(boundaryEvent);
  assert.equal(boundaryEvent.wasConsumed(), true);
  assert.equal(app.getActiveIndex(), 1);
  app.timelines[0].complete();
  assert.equal(app.scroller.scrollTop, app.getPanelStartScrollTop(1));

  app.clock.advance(180);
  const newProjectEvent = createWheelEvent();
  app.handlers.wheel(newProjectEvent);
  assert.equal(newProjectEvent.wasConsumed(), false);
  assert.equal(app.getActiveIndex(), 1);
  app.cleanup();
});

test("the first and last project release the scroll to adjacent sections", () => {
  const app = setup();
  app.scroller.scrollTop = app.sectionTop;

  const leaveTowardsServices = createWheelEvent(-60);
  app.handlers.wheel(leaveTowardsServices);
  assert.equal(leaveTowardsServices.wasConsumed(), false);
  assert.equal(app.getActiveIndex(), 0);
  assert.equal(app.timelines.length, 0);

  app.scroller.scrollTop = app.getPanelEndScrollTop(0);
  app.handlers.wheel(createWheelEvent());
  app.timelines[0].complete();
  app.clock.advance(180);
  app.scroller.scrollTop = app.getPanelEndScrollTop(1);
  app.handlers.wheel(createWheelEvent());
  app.timelines[1].complete();
  app.clock.advance(180);
  app.scroller.scrollTop = app.getPanelEndScrollTop(2);

  const leaveLastProject = createWheelEvent();
  app.handlers.wheel(leaveLastProject);
  assert.equal(leaveLastProject.wasConsumed(), false);
  assert.equal(app.getActiveIndex(), 2);
  assert.equal(app.timelines.length, 2);
  app.cleanup();
});

test("project traversal uses real sequential positions instead of wrapping", () => {
  const hookSource = readFileSync(
    new URL(
      "../src/pages/publicSite/featuredProjects/hooks/useFeaturedProjectsPanelLoop.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(hookSource, /nextIndex = activeIndexRef\.current \+ direction/);
  assert.match(hookSource, /activeTween\.to\(scrollContainer, \{ scrollTop: targetScrollTop \}/);
  assert.doesNotMatch(hookSource, /gsap\.utils\.wrap/);
});
