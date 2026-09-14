import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as servicesProgress from "../src/pages/publicSite/services/utils/servicesProgress.js";
import { createFakeClock } from "./helpers/fakeClock.js";
import * as navigation from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";
import * as sectionNavigationMotion from "../src/pages/publicSite/utils/sectionNavigationMotion.js";

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
  const featuredProjectHeight = 1400;
  const scroller = {
    scrollTop: 0, clientHeight: 800,
    getBoundingClientRect: () => ({ top: 0, bottom: 800, height: 800 }),
    querySelectorAll: () => [services, featured],
    addEventListener: (type, handler) => { handlers[type] = handler; },
    removeEventListener: (type) => { delete handlers[type]; },
  };
  const featuredProjects = [0, 1, 2].map((index) => ({
    offsetHeight: featuredProjectHeight,
    getBoundingClientRect() {
      const top = featured.offsetTop + (index * featuredProjectHeight) - scroller.scrollTop;
      return { top, bottom: top + featuredProjectHeight, height: featuredProjectHeight };
    },
  }));
  featured.querySelectorAll = () => featuredProjects;
  featured.querySelector = () => null;
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
  const createController = loadFunction(
    "../src/pages/publicSite/home/hooks/useHomeScrollController.js",
    "useHomeScrollController", {
      ...navigation, ...servicesProgress, ...sectionNavigationMotion,
      gsap, window, ScrollToPlugin: {}, createHomeStatementController,
      Element: class {}, useCallback: (callback) => callback,
      useLayoutEffect: (effect) => effects.push(effect),
      useRef: (current) => ({ current }), useState: (initial) => {
        const index = states.length;
        states.push(initial);
        return [initial, (value) => {
          states[index] = typeof value === "function" ? value(states[index]) : value;
        }];
      },
      useMotionValue: (initial) => {
        let value = initial;
        return { get: () => value, set: (next) => { value = next; } };
      },
    },
  );
  const controller = createController({ enabled: true, initialScrollReady: true, reduceMotion });
  controller.scrollerRef.current = scroller;
  const cleanups = effects.map((effect) => effect());
  const flush = () => {
    while (tweens.length) tweens.shift()();
    while (frames.length) frames.shift()();
  };
  flush();
  const revealTitle = () => {
    clock.advance(180);
    handlers.keydown({ key: 'ArrowDown', preventDefault() {} });
    controller.completeSectionTitleReveal(states[2]);
    clock.advance(180);
  };
  return { controller, handlers, scroller, panels, services, featured, featuredProjects, flush, clock, revealTitle, getRevealedSection: () => states[4], getActiveSection: () => states[2], getFeaturedStep: () => states[3], getActiveFeaturedProject: () => states[5], getPendingTweenCount: () => tweens.length, cleanup: () => cleanups.forEach((fn) => fn?.()) };
}


test('services heading reveals on arrival before native content scrolling resumes', () => {
  const app = setup();
  const wheel = () => {
    let prevented = false;
    app.handlers.wheel({ deltaY: 60, deltaX: 0, timeStamp: 0, preventDefault() { prevented = true; } });
    return prevented;
  };
  app.controller.navigateToSection('services');
  assert.equal(wheel(), true);
  app.flush();
  assert.equal(app.getRevealedSection(), 'services');
  assert.equal(app.scroller.scrollTop, 3200);
  assert.equal(wheel(), true, 'Wait for the reveal animation');
  app.controller.completeSectionTitleReveal('featured-projects');
  assert.equal(wheel(), true, 'Ignore completion from another heading');
  app.controller.completeSectionTitleReveal('services');
  app.clock.advance(180);
  assert.equal(wheel(), false);
  app.scroller.scrollTop = 4400;
  app.handlers.scroll();
  assert.equal(app.getRevealedSection(), 'featured-projects');
  assert.equal(wheel(), true);
  assert.equal(app.getRevealedSection(), 'featured-projects');
  app.clock.advance(180);
  assert.equal(wheel(), true);
  assert.equal(app.getRevealedSection(), 'featured-projects');
  assert.equal(app.scroller.scrollTop, 4400);
  app.cleanup();
  assert.equal(app.clock.pending(), 0);
});

test('services heading reveals immediately on every section entry', () => {
  const app = setup();
  app.controller.navigateToSection('services'); app.flush();
  let prevented = false;
  app.handlers.keydown({ key: 'ArrowDown', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(app.getRevealedSection(), 'services');
  assert.equal(app.scroller.scrollTop, 3200);
  app.controller.navigateToSection('featured-projects'); app.flush();
  app.controller.navigateToSection('services'); app.flush();
  assert.equal(app.getRevealedSection(), 'services');
  assert.equal(app.scroller.scrollTop, 3200);
  app.cleanup();
});

for (const reducedMotion of [false, true]) {
  test('continuous content preserves native input and navigation: ' + reducedMotion, () => {
    const app = setup(reducedMotion);
    app.controller.navigateToSection('services'); app.flush();
    assert.equal(app.scroller.scrollTop, 3200);
    app.revealTitle();
    const blocked = () => assert.fail('Native scrolling was blocked');
    for (const deltaMode of [0, 1, 2]) app.handlers.wheel({ deltaMode, deltaY: 60, deltaX: 0, preventDefault: blocked });
    for (const key of ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'End', 'Home']) app.handlers.keydown({ key, preventDefault: blocked });
    app.handlers.pointerdown({ pointerType: 'touch', isPrimary: true, pointerId: 1, clientX: 100, clientY: 300 });
    app.handlers.pointermove({ pointerId: 1, clientX: 100, clientY: 100, preventDefault: blocked });
    for (const top of [3500, 4000, 4450, 4700, 4200, 3400, 3300]) {
      app.scroller.scrollTop = top; app.handlers.scroll(); app.flush();
      assert.equal(app.scroller.scrollTop, top);
      assert.equal(app.getActiveSection(), top + 64 >= 4400 ? 'featured-projects' : 'services');
    }
    app.handlers.resize(); app.flush();
    assert.equal(app.scroller.scrollTop, 3300);
    app.controller.navigateToSection('home'); app.flush();
    assert.equal(app.scroller.scrollTop, 0);
    assert.equal(app.getActiveSection(), null);
    app.cleanup();
    assert.equal(app.clock.pending(), 0);
  });
}

test('viewport growth cannot return continuous content to the video', () => {
  const app = setup();
  app.controller.navigateToSection('services'); app.flush();
  app.revealTitle();
  app.panels[3].offsetTop = 3600;
  app.services.offsetTop = 4800;
  app.featured.offsetTop = 6000;
  app.handlers.resize(); app.flush();
  assert.equal(app.scroller.scrollTop, 4800);
  app.handlers.wheel({ deltaY: 60, preventDefault() { assert.fail('Native scroll blocked after resize'); } });
  app.cleanup();
});

test('gallery reveals on entering the viewport without snapping or hiding again', () => {
  const app = setup();
  app.featured.querySelector = () => ({
    getBoundingClientRect: () => ({ top: 5000 - app.scroller.scrollTop }),
  });
  app.controller.navigateToSection('services'); app.flush();
  assert.equal(app.getFeaturedStep(), 1);
  app.scroller.scrollTop = 4210; app.handlers.scroll();
  assert.equal(app.getFeaturedStep(), 2);
  assert.equal(app.scroller.scrollTop, 4210);
  app.scroller.scrollTop = 3800; app.handlers.scroll();
  assert.equal(app.getFeaturedStep(), 2);
  assert.equal(app.scroller.scrollTop, 3800);
  app.cleanup();
});

test('an early gallery reveal cannot leave featured-project scrolling locked', () => {
  const app = setup();
  app.featured.querySelector = () => ({
    getBoundingClientRect: () => ({ top: 5000 - app.scroller.scrollTop }),
  });
  app.controller.navigateToSection('services'); app.flush();
  app.revealTitle();

  app.scroller.scrollTop = 4210; app.handlers.scroll();
  assert.equal(app.getFeaturedStep(), 2);
  assert.equal(app.getActiveSection(), 'services');

  app.scroller.scrollTop = 4400; app.handlers.scroll();
  assert.equal(app.getActiveSection(), 'featured-projects');
  assert.equal(app.getRevealedSection(), 'featured-projects');
  app.clock.advance(180);

  let prevented = false;
  app.handlers.wheel({
    deltaY: 60,
    deltaX: 0,
    timeStamp: 400,
    preventDefault() { prevented = true; },
  });
  assert.equal(prevented, true);
  assert.equal(app.getRevealedSection(), 'featured-projects');

  app.controller.completeSectionTitleReveal('featured-projects');
  app.clock.advance(180);
  app.handlers.wheel({
    deltaY: 60,
    deltaX: 0,
    timeStamp: 800,
    preventDefault() { assert.fail('Featured-project scroll stayed locked'); },
  });
  app.cleanup();
});

test('direct navigation updates the section and reveals an already visible gallery', () => {
  const app = setup();
  app.featured.querySelector = () => ({
    getBoundingClientRect: () => ({ top: 4800 - app.scroller.scrollTop }),
  });
  app.controller.navigateToSection('services');
  app.controller.navigateToSection('featured-projects'); app.flush();
  assert.equal(app.scroller.scrollTop, 4400);
  assert.equal(app.getActiveSection(), 'featured-projects');
  assert.equal(app.getFeaturedStep(), 2);
  app.cleanup();
});

test('returning to the video restores its introduction controls at the services boundary', () => {
  const app = setup(true);
  app.controller.navigateToSection('services'); app.flush();
  app.scroller.scrollTop = 3210; app.handlers.scroll(); app.flush();
  assert.equal(app.scroller.scrollTop, 3210);
  app.scroller.scrollTop = 3190; app.handlers.scroll(); app.flush();
  assert.equal(app.scroller.scrollTop, 2400);
  assert.equal(app.controller.statementProgress.get(), 0);
  app.handlers.keydown({ key: 'ArrowUp', preventDefault() {} }); app.flush();
  assert.equal(app.controller.statementProgress.get(), 1);
  app.cleanup();
});

test('crossing above services animates to the video and consumes input until completion', () => {
  const app = setup();
  app.controller.navigateToSection('services'); app.flush();
  app.scroller.scrollTop = 3190;
  app.handlers.scroll();
  assert.equal(app.scroller.scrollTop, 3190);
  let prevented = false;
  app.handlers.wheel({ deltaY: -60, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  app.flush();
  assert.equal(app.scroller.scrollTop, 2400);
  assert.equal(app.getActiveSection(), null);
  assert.equal(app.controller.statementProgress.get(), 0);
  app.cleanup();
});

test('an unfinished explicit navbar jump temporarily consumes wheel input', () => {
  const app = setup();
  app.controller.navigateToSection('services');
  let prevented = false;
  app.handlers.wheel({ deltaY: 60, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  app.handlers.wheel({ ctrlKey: true, preventDefault() { assert.fail('Zoom blocked'); } });
  app.flush();
  app.revealTitle();
  app.handlers.wheel({ deltaY: 60, preventDefault() { assert.fail('Scroll blocked'); } });
  app.controller.navigateToSection('featured-projects');
  app.controller.navigateToSection('home'); app.flush();
  assert.equal(app.scroller.scrollTop, 0);
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
test("the scrollbar cannot skip the intro and video to enter Services", () => {
  const app = setup();
  app.scroller.scrollTop = 2402;
  app.handlers.scroll();
  assert.equal(app.scroller.scrollTop, 0);
  app.flush();
  assert.equal(app.scroller.scrollTop, 0);
  app.cleanup();
});

test("Home exclusively coordinates the sequential featured-project traversal", () => {
  const app = setup();
  let timeStamp = 0;
  const wheel = (deltaY) => {
    let prevented = false;
    app.handlers.wheel({
      deltaX: 0,
      deltaY,
      timeStamp: timeStamp += 16,
      preventDefault() { prevented = true; },
      stopPropagation() {},
    });
    if (!prevented) {
      app.scroller.scrollTop += deltaY;
      app.handlers.scroll();
    }
    return prevented;
  };
  const repeatWheel = (deltaY, count) =>
    Array.from({ length: count }, () => wheel(deltaY));

  app.controller.navigateToSection("featured-projects");
  app.flush();
  app.controller.completeSectionTitleReveal("featured-projects");
  app.clock.advance(180);

  app.scroller.scrollTop = 4880;
  app.handlers.scroll();
  const quintaTrackpadEvents = repeatWheel(8, 18);
  assert.equal(quintaTrackpadEvents.slice(0, 14).every((value) => !value), true);
  assert.equal(quintaTrackpadEvents.slice(14).every(Boolean), true);
  assert.equal(app.scroller.scrollTop, 4992, "The viewport stays inside Quinta while the boundary gesture accumulates");
  assert.equal(app.getPendingTweenCount(), 1, "Only one transition is queued");
  assert.equal(app.getActiveFeaturedProject(), 0, "The incoming project stays inactive during the tween");
  app.flush();
  assert.equal(app.scroller.scrollTop, 5800);
  assert.equal(app.getActiveFeaturedProject(), 1);

  app.clock.advance(180);
  app.scroller.scrollTop = 6320;
  app.handlers.scroll();
  const muelleTrackpadEvents = repeatWheel(8, 14);
  assert.equal(muelleTrackpadEvents.slice(0, 10).every((value) => !value), true);
  assert.equal(muelleTrackpadEvents.slice(10).every(Boolean), true);
  assert.equal(app.getPendingTweenCount(), 1);
  assert.equal(app.getActiveFeaturedProject(), 1);
  app.flush();
  assert.equal(app.scroller.scrollTop, 7200);
  assert.equal(app.getActiveFeaturedProject(), 2);

  app.clock.advance(180);
  assert.equal(repeatWheel(-8, 4).every(Boolean), true);
  assert.equal(app.getPendingTweenCount(), 1);
  app.flush();
  assert.equal(app.scroller.scrollTop, 6400);
  assert.equal(app.getActiveFeaturedProject(), 1);

  app.clock.advance(180);
  app.scroller.scrollTop = 5800;
  app.handlers.scroll();
  assert.equal(repeatWheel(-8, 4).every(Boolean), true);
  assert.equal(app.getPendingTweenCount(), 1);
  app.flush();
  assert.equal(app.scroller.scrollTop, 5000);
  assert.equal(app.getActiveFeaturedProject(), 0);

  app.clock.advance(180);
  app.scroller.scrollTop = 4400;
  app.handlers.scroll();
  assert.equal(wheel(-8), false, "The first project releases scrolling towards Services");

  app.scroller.scrollTop = 7800;
  app.handlers.scroll();
  assert.equal(wheel(8), false, "The final project releases downward scrolling");
  assert.equal(app.getActiveFeaturedProject(), 2);
  app.cleanup();
});
