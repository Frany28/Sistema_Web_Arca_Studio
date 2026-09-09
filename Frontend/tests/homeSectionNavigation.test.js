import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as servicesProgress from "../src/pages/publicSite/services/utils/servicesProgress.js";
import { createFakeClock } from "./helpers/fakeClock.js";
import * as navigation from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";

function loadFunction(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8")
    .replace(/import[\s\S]*?from "[^"]+";\r?\n/g, "")
    .replace(/export \{[\s\S]*?\};/g, "")
    .replace(/export default .*;/g, "");
  return new Function(...Object.keys(dependencies), `${source}\nreturn ${name};`)(
    ...Object.values(dependencies),
  );
}

function setup(reduceMotion = false) {
  const clock = createFakeClock();
  const effects = [];
  const states = [];
  const frames = [];
  const tweens = [];
  const handlers = {};
  const panels = [0, 800, 1600, 2400].map((offsetTop) => ({ offsetTop }));
  const services = { id: "services", offsetTop: 3200 };
  const featured = { id: "featured-projects", offsetTop: 4400 };
  const scroller = {
    scrollTop: 0, clientHeight: 800,
    querySelectorAll: () => [services, featured],
    addEventListener: (type, handler) => { handlers[type] = handler; },
    removeEventListener: (type) => { delete handlers[type]; },
  };
  const window = {
    requestAnimationFrame: (callback) => { frames.push(callback); return frames.length; },
    cancelAnimationFrame() {}, clearTimeout: clock.clearTimeout, setTimeout: clock.setTimeout,
    addEventListener: (type, handler) => { handlers[type] = handler; },
    removeEventListener() {},
  };
  const gsap = {
    registerPlugin() {}, utils: { toArray: () => panels },
    to(target, options) {
      const tween = { killed: false, kill() { this.killed = true; } };
      tweens.push(() => {
        if (tween.killed) return;
        if (options.scrollTo) target.scrollTop = options.scrollTo.y;
        options.onComplete?.();
      });
      return tween;
    },
  };
  const createHomeStatementController = loadFunction(
    "../src/pages/publicSite/home/hooks/homeScroll/createHomeStatementController.js",
    "createHomeStatementController", { ...navigation, gsap, window },
  );
  const useHomeScrollController = loadFunction(
    "../src/pages/publicSite/home/hooks/useHomeScrollController.js",
    "useHomeScrollController", {
      ...navigation, ...servicesProgress, gsap, window, ScrollToPlugin: {}, createHomeStatementController,
      Element: class {}, useCallback: (callback) => callback,
      useLayoutEffect: (effect) => effects.push(effect),
      useRef: (current) => ({ current }), useState: (initial) => {
        const index = states.length;
        states.push(initial);
        return [initial, (value) => { states[index] = value; }];
      },
      useMotionValue: (initial) => {
        let value = initial;
        return { get: () => value, set: (next) => { value = next; } };
      },
    },
  );
  const controller = useHomeScrollController({ enabled: true, initialScrollReady: true, reduceMotion });
  controller.scrollerRef.current = scroller;
  const cleanups = effects.map((effect) => effect());
  const flush = () => {
    while (tweens.length) tweens.shift()();
    while (frames.length) frames.shift()();
  };
  flush();
  return { controller, handlers, scroller, featured, flush, clock, getActiveSection: () => states[3], getFeaturedStep: () => states[4], getServicesStep: () => states[2], cleanup: () => cleanups.forEach((fn) => fn?.()) };
}

for (const reducedMotion of [false, true]) {
  test(`navbar jumps to featured projects and tracks its active item (reduced motion: ${reducedMotion})`, () => {
    const app = setup(reducedMotion);
    app.controller.navigateToSection("services");
    app.controller.navigateToSection("featured-projects");
    app.flush();
    assert.equal(app.scroller.scrollTop, 4400);
    assert.equal(app.getActiveSection(), "featured-projects");
    assert.equal(app.getFeaturedStep(), 0);
    app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    assert.equal(app.getFeaturedStep(), 1);
    app.handlers.keydown({ key: "ArrowUp", preventDefault() {} });
    app.flush();
    assert.equal(app.scroller.scrollTop, 4400);
    app.controller.completeFeaturedReveal();
    app.handlers.keydown({ key: "ArrowUp", preventDefault() {} });
    app.flush();
    assert.equal(app.scroller.scrollTop, 3200);
    assert.equal(app.getActiveSection(), "services");
    app.cleanup();
  });
}

test("the internal services exit respects completion and moves directly to featured projects", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.flush();
  app.controller.advanceFromServices();
  app.flush();
  assert.equal(app.getActiveSection(), "services");
  for (const step of [1, 2]) {
    app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(step);
  }
  app.controller.completeServiceCategories(true);
  app.controller.advanceFromServices();
  app.flush();
  assert.equal(app.scroller.scrollTop, 4400);
  assert.equal(app.getActiveSection(), "featured-projects");
  assert.equal(app.getFeaturedStep(), 0);
  app.cleanup();
});

test("services cannot expose featured projects before all categories are visited", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.flush();
  for (const step of [1, 2]) {
    app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(step);
  }
  app.scroller.scrollTop = 4300;
  app.handlers.scroll();
  app.flush();
  assert.equal(app.scroller.scrollTop, 3600);
  assert.equal(app.getActiveSection(), "services");
  app.controller.completeServiceCategories(true);
  app.handlers.keydown({ key: "PageDown", preventDefault() {} });
  app.flush();
  assert.equal(app.scroller.scrollTop, 4400);
  assert.equal(app.getActiveSection(), "featured-projects");
  assert.equal(app.getFeaturedStep(), 0);
  app.handlers.keydown({ key: "ArrowUp", preventDefault() {} });
  app.controller.completeFeaturedReveal();
  app.handlers.keydown({ key: "ArrowUp", preventDefault() {} });
  app.flush();
  assert.equal(app.getServicesStep(), 2);
  app.cleanup();
});

test("featured heading consumes one wheel gesture and blocks scrollbar until reveal completes", () => {
  const app = setup();
  app.controller.navigateToSection("featured-projects");
  app.flush();
  const wheel = () => app.handlers.wheel({ deltaY: -60, deltaX: 0, timeStamp: 0, preventDefault() {} });
  wheel();
  assert.equal(app.getFeaturedStep(), 1);
  app.scroller.scrollTop = 3200;
  app.handlers.scroll();
  assert.equal(app.scroller.scrollTop, 4400);
  app.controller.completeFeaturedReveal();
  wheel();
  app.flush();
  assert.equal(app.scroller.scrollTop, 4400);
  app.clock.advance(180);
  wheel();
  app.flush();
  assert.equal(app.getActiveSection(), "services");
  app.cleanup();
});

test("navbar can interrupt the featured reveal and resize keeps the new section aligned", () => {
  const app = setup();
  app.controller.navigateToSection("featured-projects");
  app.flush();
  app.featured.offsetTop = 4700;
  app.handlers.resize();
  assert.equal(app.scroller.scrollTop, 4700);
  app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
  app.controller.navigateToSection("home");
  app.controller.completeFeaturedReveal();
  app.flush();
  assert.equal(app.scroller.scrollTop, 0);
  assert.equal(app.getActiveSection(), null);
  app.cleanup();
});

test("rapid keyboard and wheel gestures cannot overlap service reveal animations", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.flush();
  const down = () => app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
  down();
  down();
  app.handlers.wheel({ deltaY: 100, deltaX: 0, timeStamp: 1000, preventDefault() {} });
  assert.equal(app.getServicesStep(), 1);
  app.controller.completeServicesStep(2);
  down();
  assert.equal(app.getServicesStep(), 1);
  app.controller.completeServicesStep(1);
  down();
  assert.equal(app.getServicesStep(), 2);
  app.scroller.scrollTop = 3300;
  app.handlers.scroll();
  assert.equal(app.scroller.scrollTop, 3200);
  app.controller.completeServicesStep(2);
  app.scroller.scrollTop = 3300;
  app.handlers.scroll();
  assert.equal(app.scroller.scrollTop, 3300);
  app.cleanup();
  assert.equal(app.clock.pending(), 0);
});

test("unvisited categories block scrollbar exit while navbar remains available", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.flush();
  for (const step of [1, 2]) {
    app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(step);
  }
  app.scroller.scrollTop = 3190;
  app.handlers.scroll();
  assert.equal(app.scroller.scrollTop, 3200);
  app.controller.completeServiceCategories(true);
  app.scroller.scrollTop = 3190;
  app.handlers.scroll();
  app.flush();
  assert.equal(app.scroller.scrollTop, 2400);
  app.cleanup();
});

for (const deltaMode of [0, 1, 2]) {
  test(`wheel mode ${deltaMode} rearms only after a new gesture`, () => {
    const app = setup();
    app.controller.navigateToSection("services");
    app.flush();
    const wheel = () => app.handlers.wheel({ deltaMode, deltaY: 40, deltaX: 0, timeStamp: 0, preventDefault() {} });
    wheel();
    app.controller.completeServicesStep(1);
    wheel();
    assert.equal(app.getServicesStep(), 1);
    app.clock.advance(180);
    wheel();
    assert.equal(app.getServicesStep(), 2);
    app.cleanup();
  });
}

test("Ctrl-wheel zoom is not intercepted even during an animated transition", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.handlers.wheel({ ctrlKey: true, deltaY: -100, preventDefault() { assert.fail("Zoom was blocked"); } });
  app.flush();
  assert.equal(app.getServicesStep(), 0);
  app.cleanup();
});

test("a late title callback from another panel cannot unlock the current reveal", () => {
  const app = setup();
  const down = () => app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
  down(); app.flush();
  down();
  app.controller.completeTitleReveal(0);
  down(); app.flush();
  assert.equal(app.scroller.scrollTop, 800);
  app.controller.completeTitleReveal(1);
  down(); app.flush();
  assert.equal(app.scroller.scrollTop, 1600);
  app.cleanup();
});

test("Services enters empty and reveals its two containers on separate wheel gestures", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.flush();
  assert.equal(app.getServicesStep(), 0);
  const wheel = (deltaY, timeStamp) => app.handlers.wheel({ deltaY, deltaX: 0, timeStamp, preventDefault() {} });
  wheel(50, 1000);
  assert.equal(app.getServicesStep(), 1);
  wheel(40, 1050);
  assert.equal(app.getServicesStep(), 1);
  app.controller.completeServicesStep(1);
  wheel(1, 1100);
  wheel(50, 1300);
  assert.equal(app.getServicesStep(), 2);
  assert.equal(app.scroller.scrollTop, 3200);
  app.cleanup();
});

for (const reducedMotion of [false, true]) {
  test(`Services uses continuous scroll and the logo returns to Home (reduced motion: ${reducedMotion})`, () => {
    const app = setup(reducedMotion);
    app.controller.navigateToSection("services");
    app.flush();
    app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
    app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
    assert.equal(app.scroller.scrollTop, 3200);
    assert.equal(app.controller.statementProgress.get(), 1);
    let prevented = false;
    app.handlers.wheel({ deltaY: 100, preventDefault() { prevented = true; } });
    assert.equal(prevented, false);
    app.scroller.scrollTop = 3500;
    app.handlers.scroll();
    app.handlers.resize();
    app.flush();
    assert.equal(app.scroller.scrollTop, 3500);
    app.controller.navigateToSection("about");
    app.flush();
    assert.equal(app.scroller.scrollTop, 3500);
    app.controller.navigateToSection("home");
    app.flush();
    assert.equal(app.scroller.scrollTop, 0);
    app.cleanup();
  });
}

test("scrolling back from Services restores the statement before the intro sequence", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.flush();
  app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
  app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
  app.controller.completeServiceCategories(true);
  app.scroller.scrollTop = 3190;
  app.handlers.scroll();
  app.flush();
  assert.equal(app.scroller.scrollTop, 2400);
  assert.equal(app.controller.statementProgress.get(), 1);
  app.cleanup();
});

test("Services blocks native scrolling until its section transition finishes", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  let prevented = false;
  app.handlers.wheel({ deltaY: 100, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  app.flush();
  assert.equal(app.scroller.scrollTop, 3200);
  app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
  app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
  prevented = false;
  app.handlers.wheel({ deltaY: 100, preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
  app.cleanup();
});

test("the scrollbar cannot skip the intro and video to enter Services", () => {
  const app = setup();
  app.scroller.scrollTop = 2402;
  app.handlers.scroll();
  assert.equal(app.scroller.scrollTop, 0);
  app.flush();
  assert.equal(app.scroller.scrollTop, 0);
  app.cleanup();
});

test("Services keeps scroll steps mandatory but the navbar can leave immediately", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.flush();
  assert.equal(app.scroller.scrollTop, 3200);
  app.scroller.scrollTop = 2400;
  app.handlers.scroll();
  assert.equal(app.scroller.scrollTop, 3200);
  app.handlers.keydown({ key: "ArrowUp", preventDefault() {} });
  app.controller.completeServicesStep(app.getServicesStep());
  assert.equal(app.getServicesStep(), 1);
  app.controller.navigateToSection("home");
  app.flush();
  assert.equal(app.scroller.scrollTop, 0);
  app.cleanup();
});

test("navbar can leave an image whose title is still pending", () => {
  const app = setup();
  app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
  app.flush();
  assert.equal(app.scroller.scrollTop, 800);
  app.controller.navigateToSection("services");
  app.flush();
  assert.equal(app.scroller.scrollTop, 3200);
  app.cleanup();
});

test("a new navbar destination replaces an unfinished section transition", () => {
  const app = setup();
  app.controller.navigateToSection("services");
  app.controller.navigateToSection("home");
  app.flush();
  assert.equal(app.scroller.scrollTop, 0);
  app.cleanup();
});

for (const input of ["wheel", "keyboard", "touch"]) {
  test(`${input} continues to Services after completing the statement`, () => {
    const app = setup();
    app.controller.navigateToSection("services");
    app.flush();
    app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
    app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
    app.controller.completeServiceCategories(true);
    app.scroller.scrollTop = 2400;
    app.handlers.scroll();
    app.flush();
    if (input === "wheel") {
      app.handlers.wheel({ deltaY: 80, timeStamp: 1000, preventDefault() {} });
    } else if (input === "keyboard") {
      app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    app.controller.completeServicesStep(app.getServicesStep());
    } else {
      app.handlers.pointerdown({ pointerType: "touch", isPrimary: true, pointerId: 1, clientX: 100, clientY: 300 });
      app.handlers.pointermove({ pointerId: 1, clientX: 100, clientY: 200, preventDefault() {} });
    }
    app.flush();
    assert.equal(app.scroller.scrollTop, 3200);
    app.cleanup();
  });
}
