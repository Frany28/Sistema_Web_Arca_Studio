import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { visitServiceCategory } from "../src/pages/publicSite/services/utils/servicesProgress.js";
import { createFakeClock } from "./helpers/fakeClock.js";
import * as navigation from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";

function setup(reducedMotion = false) {
  const clock = createFakeClock();
  const completion = [];
  const exits = [];
  const returns = [];
  const durations = [];
  const handlers = {};
  const effects = [];
  const selected = [];
  const tabs = [0, 1, 2].map((i) => ({ offsetTop: i * 50, offsetHeight: 30 }));
  const slides = [{}, {}, {}];
  const indicator = {};
  const section = {
    querySelectorAll: (selector) => selector.includes('role=') ? tabs : slides,
    querySelector: () => indicator,
    addEventListener: (type, handler) => { handlers[type] = handler; },
    removeEventListener: (type) => { delete handlers[type]; },
  };
  Object.defineProperty(section, "scrollTop", { set() { assert.fail("El selector no debe desplazar la p?gina"); } });
  const dependencies = {
    ...navigation, visitServiceCategory,
    useLayoutEffect: (effect) => effects.push(effect),
    useRef: (current) => ({ current }), useState: (value) => [value, (next) => selected.push(next)],
    useReducedMotion: () => reducedMotion,
    gsap: { to(target, options) { durations.push(options.duration); }, set() {}, killTweensOf() {}, context(fn) { fn(); return { revert() {} }; } },
    getComputedStyle: () => ({ lineHeight: "30" }),
    ResizeObserver: class { observe() {} disconnect() {} },
    document: { fonts: { ready: Promise.resolve() } },
    setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
  };
  const source = readFileSync(new URL("../src/pages/publicSite/services/hooks/useServicesCategoryScroll.js", import.meta.url), "utf8")
    .replace(/import[^;]+;\s*/g, "")
    .replace("export default useServicesCategoryScroll;", "return useServicesCategoryScroll;");
  const hook = new Function(...Object.keys(dependencies), source)(...Object.values(dependencies));
  const api = hook({ current: section }, { current: { clientHeight: 600 } }, [{}, {}, {}], true, (value) => completion.push(value), () => exits.push(true), () => returns.push(true));
  const cleanup = effects[0]();
  return { handlers, selected, cleanup, api, clock, completion, durations, exits, returns };
}

test("scrolling up at the first service releases the selector without completing categories", () => {
  const app = setup();
  const up = () => app.handlers.wheel({ deltaY: -60, deltaX: 0, timeStamp: 0, preventDefault() {}, stopPropagation() {} });
  up(); up();
  assert.equal(app.returns.length, 1);
  assert.equal(app.completion.at(-1), false);
  app.cleanup();
});

test("the next wheel gesture after the last visited service requests the next section", () => {
  const app = setup();
  const wheel = () => app.handlers.wheel({ deltaY: 60, deltaX: 0, timeStamp: 0, preventDefault() {}, stopPropagation() {} });
  wheel();
  app.clock.advance(180);
  wheel();
  wheel();
  assert.equal(app.exits.length, 0);
  app.clock.advance(180);
  wheel();
  wheel();
  assert.equal(app.exits.length, 1);
  app.cleanup();
});

test("jumping straight to the last service does not allow exit with unvisited categories", () => {
  const app = setup();
  app.api.selectCategory(2);
  app.handlers.wheel({ deltaY: 60, deltaX: 0, timeStamp: 0, preventDefault() {}, stopPropagation() {} });
  assert.equal(app.exits.length, 0);
  app.cleanup();
});

test("internal wheel consumes inertia, rearms after idle and cleans its timer", () => {
  const app = setup();
  const wheel = () => app.handlers.wheel({ deltaY: 60, deltaX: 0, timeStamp: 0, preventDefault() {}, stopPropagation() {} });
  wheel(); wheel();
  assert.equal(app.selected.at(-1), 1);
  app.clock.advance(180);
  wheel();
  assert.equal(app.selected.at(-1), 2);
  assert.equal(app.completion.at(-1), true);
  app.cleanup();
  assert.equal(app.clock.pending(), 0);
});

test("manual tab selection must visit every category before signaling completion", () => {
  const app = setup();
  app.api.selectCategory(2);
  assert.equal(app.completion.at(-1), false);
  app.api.selectCategory(1);
  assert.equal(app.completion.at(-1), true);
  app.cleanup();
});

test("reduced motion still allows category selection with zero animation duration", () => {
  const app = setup(true);
  app.api.selectCategory(1);
  assert.equal(app.selected.at(-1), 1);
  assert.ok(app.durations.every((duration) => duration === 0));
  app.cleanup();
});

test("internal selector ignores Ctrl-wheel zoom and horizontal gestures", () => {
  const app = setup();
  const fail = () => assert.fail("Native gesture was intercepted");
  app.handlers.wheel({ deltaX: 0, deltaY: -50, ctrlKey: true, preventDefault: fail });
  app.handlers.wheel({ deltaX: 100, deltaY: 1, preventDefault: fail });
  assert.equal(app.selected.at(-1), 0);
  app.cleanup();
});

test("wheel changes categories internally and contains scrolling at both boundaries", () => {
  const app = setup();
  const wheel = (deltaY, timeStamp) => {
    let prevented = false;
    let stopped = false;
    app.handlers.wheel({ deltaY, deltaX: 0, timeStamp,
      preventDefault() { prevented = true; }, stopPropagation() { stopped = true; } });
    assert.equal(prevented, true);
    assert.equal(stopped, true);
  };
  wheel(-50, 0);
  assert.equal(app.selected.at(-1), 0);
  wheel(50, 300);
  assert.equal(app.selected.at(-1), 1);
  wheel(50, 320);
  assert.equal(app.selected.at(-1), 1);
  app.api.selectCategory(2);
  wheel(50, 340);
  assert.equal(app.selected.at(-1), 2);
  app.cleanup();
  assert.deepEqual(app.handlers, {});
});

test("touch changes a category without moving the outer scroll", () => {
  const app = setup();
  app.handlers.pointerdown({ pointerType: "touch", isPrimary: true, pointerId: 1, clientX: 50, clientY: 200 });
  let prevented = false;
  app.handlers.pointermove({ pointerId: 1, clientX: 50, clientY: 100,
    preventDefault() { prevented = true; }, stopPropagation() {} });
  assert.equal(prevented, true);
  assert.equal(app.selected.at(-1), 1);
  app.cleanup();
});
