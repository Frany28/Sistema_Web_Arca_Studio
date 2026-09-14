import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createFakeClock } from "./helpers/fakeClock.js";

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
  const stage = {
    addEventListener(type, handler) {
      handlers[type] = handler;
    },
    removeEventListener(type) {
      delete handlers[type];
    },
  };
  const window = {
    clearTimeout: clock.clearTimeout,
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

  const eventDuringTransition = createWheelEvent();
  app.handlers.wheel(eventDuringTransition);
  app.timelines[0].complete();
  app.handlers.wheel(createWheelEvent());

  assert.equal(eventDuringTransition.wasConsumed(), true);
  assert.equal(app.getActiveIndex(), 1);
  assert.equal(app.timelines.length, 1);

  app.clock.advance(180);
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
