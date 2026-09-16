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
  const services = {
    id: "services",
    offsetTop: 3200,
    offsetHeight: 1200,
    dataset: { contentTitleScope: "services" },
  };
  const featured = { id: "featured-projects", offsetTop: 4400 };
  const processSection = {
    id: "process",
    offsetTop: 8600,
    offsetHeight: 1600,
    dataset: { contentTitleScope: "process" },
  };
  const featuredProjectHeight = 1400;
  const scroller = {
    scrollTop: 0, clientHeight: 800,
    getBoundingClientRect: () => ({ top: 0, bottom: 800, height: 800 }),
    querySelectorAll: (selector) => selector === "[data-content-title-scope]"
      ? [services, ...featuredProjects, processSection]
      : [services, featured, processSection],
    addEventListener: (type, handler) => { handlers[type] = handler; },
    removeEventListener: (type) => { delete handlers[type]; },
  };
  const featuredTitleIds = [
    "featured-project-quinta-bella-vista",
    "featured-project-muelle-zulima",
    "featured-project-apto-jc",
  ];
  const featuredProjects = [0, 1, 2].map((index) => ({
    offsetHeight: featuredProjectHeight,
    dataset: { contentTitleScope: featuredTitleIds[index] },
    querySelector: (selector) => selector === "[data-featured-image-gallery]"
      ? {}
      : null,
    getBoundingClientRect() {
      const top = featured.offsetTop + (index * featuredProjectHeight) - scroller.scrollTop;
      return { top, bottom: top + featuredProjectHeight, height: featuredProjectHeight };
    },
  }));
  services.getBoundingClientRect = () => ({
    top: services.offsetTop - scroller.scrollTop,
    bottom: featured.offsetTop - scroller.scrollTop,
  });
  processSection.getBoundingClientRect = () => ({
    top: processSection.offsetTop - scroller.scrollTop,
    bottom: processSection.offsetTop + 1600 - scroller.scrollTop,
  });
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
  return {
    controller,
    handlers,
    scroller,
    panels,
    services,
    featured,
    processSection,
    featuredProjects,
    flush,
    clock,
    getVisibleTitles: () => states[4],
    getActiveSection: () => states[2],
    getFeaturedStep: () => states[3],
    getActiveFeaturedProject: () => states[5],
    getFeaturedExpansionProgress: (index) =>
      controller.featuredProjectExpansionProgress[index].get(),
    getPendingTweenCount: () => tweens.length,
    cleanup: () => cleanups.forEach((fn) => fn?.()),
  };
}


test('content titles follow complete viewport exit instead of active navigation state', () => {
  const app = setup();
  const wheel = () => {
    let prevented = false;
    app.handlers.wheel({ deltaY: 60, deltaX: 0, timeStamp: 0, preventDefault() { prevented = true; } });
    return prevented;
  };
  app.controller.navigateToSection('services');
  assert.equal(wheel(), true);
  app.flush();
  assert.deepEqual(app.getVisibleTitles(), ['services']);
  assert.equal(app.scroller.scrollTop, 3200);
  assert.equal(wheel(), false, 'The automatic title reveal does not lock scrolling');

  app.scroller.scrollTop = 4399;
  app.handlers.scroll();
  assert.equal(app.getActiveSection(), 'featured-projects');
  assert.deepEqual(
    app.getVisibleTitles(),
    ['services', 'featured-project-quinta-bella-vista'],
    'Services stays revealed while its final pixel remains visible',
  );

  app.scroller.scrollTop = 4400;
  app.handlers.scroll();
  assert.deepEqual(app.getVisibleTitles(), ['featured-project-quinta-bella-vista']);

  app.scroller.scrollTop = 4399;
  app.handlers.scroll();
  assert.deepEqual(
    app.getVisibleTitles(),
    ['services', 'featured-project-quinta-bella-vista'],
    'The same rule applies immediately when reversing direction',
  );
  app.cleanup();
  assert.equal(app.clock.pending(), 0);
});

test('project and process titles keep the same last-pixel rule in both directions', () => {
  const app = setup();
  const scrollTo = (scrollTop) => {
    app.scroller.scrollTop = scrollTop;
    app.handlers.scroll();
    return app.getVisibleTitles();
  };
  const quinta = 'featured-project-quinta-bella-vista';
  const muelle = 'featured-project-muelle-zulima';
  const apto = 'featured-project-apto-jc';

  app.controller.navigateToSection('featured-projects');
  app.flush();

  assert.deepEqual(scrollTo(5799), [quinta, muelle]);
  assert.deepEqual(scrollTo(5800), [muelle]);
  assert.deepEqual(scrollTo(7199), [muelle, apto]);
  assert.deepEqual(scrollTo(7200), [apto]);
  assert.deepEqual(scrollTo(8599), [apto, 'process']);
  assert.deepEqual(scrollTo(8600), ['process']);

  assert.deepEqual(scrollTo(8599), [apto, 'process']);
  assert.deepEqual(scrollTo(7200), [apto]);
  assert.deepEqual(scrollTo(7199), [muelle, apto]);
  assert.deepEqual(scrollTo(5800), [muelle]);
  assert.deepEqual(scrollTo(5799), [quinta, muelle]);

  app.cleanup();
});

test('services heading reveals automatically on every section entry', () => {
  const app = setup();
  app.controller.navigateToSection('services'); app.flush();
  assert.deepEqual(app.getVisibleTitles(), ['services']);
  assert.equal(app.scroller.scrollTop, 3200);
  app.controller.navigateToSection('featured-projects'); app.flush();
  app.controller.navigateToSection('services'); app.flush();
  assert.deepEqual(app.getVisibleTitles(), ['services']);
  assert.equal(app.scroller.scrollTop, 3200);
  app.cleanup();
});

for (const reducedMotion of [false, true]) {
  test('continuous content preserves native input and navigation: ' + reducedMotion, () => {
    const app = setup(reducedMotion);
    app.controller.navigateToSection('services'); app.flush();
    assert.equal(app.scroller.scrollTop, 3200);
    const blocked = () => assert.fail('Native scrolling was blocked');
    for (const [deltaMode, deltaY] of [[0, 60], [1, 1], [2, 0.1]]) {
      app.handlers.wheel({ deltaMode, deltaY, deltaX: 0, preventDefault: blocked });
    }
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

  app.scroller.scrollTop = 4210; app.handlers.scroll();
  assert.equal(app.getFeaturedStep(), 2);
  assert.equal(app.getActiveSection(), 'services');

  app.scroller.scrollTop = 4400; app.handlers.scroll();
  assert.equal(app.getActiveSection(), 'featured-projects');
  assert.deepEqual(app.getVisibleTitles(), ['featured-project-quinta-bella-vista']);

  app.handlers.wheel({
    deltaY: 60,
    deltaX: 0,
    timeStamp: 400,
    preventDefault() { assert.fail('Automatic title reveal blocked featured-project scroll'); },
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

test('process navigation reveals its title without a title-animation lock', () => {
  const app = setup();
  app.controller.navigateToSection('process');
  app.flush();

  assert.equal(app.scroller.scrollTop, app.processSection.offsetTop);
  assert.equal(app.getActiveSection(), 'process');
  assert.deepEqual(app.getVisibleTitles(), ['process']);

  app.handlers.wheel({
    deltaX: 0,
    deltaY: 60,
    timeStamp: 200,
    preventDefault() { assert.fail('Process title reveal blocked native scrolling'); },
  });
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

function createWheelDriver(app) {
  let timeStamp = 0;

  return (deltaY) => {
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
}

function placeAtContentBoundary(app, sectionId, scrollTop) {
  app.controller.navigateToSection(sectionId);
  app.flush();
  app.scroller.scrollTop = scrollTop;
  app.handlers.scroll();
}

test("content hands native scroll to a reversible scrub before navigation", () => {
  const app = setup();
  const wheel = createWheelDriver(app);
  placeAtContentBoundary(app, "featured-projects", 4880);

  assert.equal(wheel(8), false, "Scroll remains native inside Quinta");
  assert.equal(app.scroller.scrollTop, 4888);
  assert.equal(app.getPendingTweenCount(), 0);

  app.scroller.scrollTop = 4992;
  app.handlers.scroll();
  assert.equal(wheel(8), true, "The event that reaches the edge is consumed");
  assert.equal(app.scroller.scrollTop, 5000, "The handoff aligns to the exact edge");
  assert.equal(app.getPendingTweenCount(), 0, "Reaching the edge does not bypass the intent threshold");

  assert.equal(wheel(64), true);
  assert.equal(app.getFeaturedExpansionProgress(0), 0.08);
  assert.equal(app.getActiveFeaturedProject(), 0);
  assert.equal(app.getPendingTweenCount(), 0);

  app.scroller.scrollTop = 4960;
  app.handlers.scroll();
  assert.equal(
    app.scroller.scrollTop,
    5000,
    "El panel permanece fijado mientras el scrub está incompleto",
  );

  assert.equal(wheel(-32), true);
  assert.equal(app.getFeaturedExpansionProgress(0), 0.04);
  assert.equal(app.scroller.scrollTop, 5000);

  assert.equal(wheel(768), true);
  assert.equal(app.getFeaturedExpansionProgress(0), 1);
  assert.equal(app.getActiveFeaturedProject(), 0, "Fullscreen does not change the active project");
  assert.equal(app.getPendingTweenCount(), 0, "Fullscreen must render before panel navigation");

  for (const deltaY of [8, 8, 8]) {
    assert.equal(wheel(deltaY), true);
    assert.equal(app.getPendingTweenCount(), 0);
  }
  assert.equal(wheel(8), true);
  assert.equal(app.getPendingTweenCount(), 1);
  app.cleanup();

  const largeWheelApp = setup();
  const largeWheel = createWheelDriver(largeWheelApp);
  placeAtContentBoundary(largeWheelApp, "featured-projects", 4960);
  assert.equal(largeWheel(100), true);
  assert.equal(largeWheelApp.scroller.scrollTop, 5000);
  assert.equal(largeWheelApp.getPendingTweenCount(), 0);
  assert.equal(
    largeWheelApp.getFeaturedExpansionProgress(0),
    60 / 800,
    "Only the distance beyond the edge contributes to the scrub",
  );
  largeWheelApp.cleanup();
});

test("every content boundary uses one shared transition for wheel and trackpad input", () => {
  const boundaries = [
    { name: "Quinta / project 2", section: "featured-projects", edge: 5000, next: 5800, previous: 5000, projectIndex: 0 },
    { name: "project 2 / project 3", section: "featured-projects", edge: 6400, next: 7200, previous: 6400, projectIndex: 1 },
    { name: "project 3 / Process", section: "featured-projects", edge: 7800, next: 8600, previous: 7800, projectIndex: 2 },
  ];
  const inputProfiles = [
    { name: "large wheel", deltas: [100] },
    { name: "micro wheel", deltas: [8, 8, 8, 8] },
    { name: "soft trackpad", deltas: [2, 3, 5, 7, 10, 8] },
  ];

  for (const boundary of boundaries) {
    for (const profile of inputProfiles) {
      const app = setup();
      const wheel = createWheelDriver(app);
      const label = `${boundary.name} with ${profile.name}`;
      placeAtContentBoundary(app, boundary.section, boundary.edge);
      if (boundary.projectIndex !== null) {
        app.controller.featuredProjectExpansionProgress[boundary.projectIndex].set(1);
      }

      for (const deltaY of profile.deltas.slice(0, -1)) {
        assert.equal(wheel(deltaY), true, `${label} owns the boundary gesture`);
        assert.equal(app.scroller.scrollTop, boundary.edge, `${label} stays aligned`);
        assert.equal(app.getPendingTweenCount(), 0, `${label} waits for enough intent`);
      }
      assert.equal(wheel(profile.deltas.at(-1)), true);
      assert.equal(app.getPendingTweenCount(), 1, `${label} queues exactly one transition`);

      for (const residualDelta of [40, 20, 8]) {
        assert.equal(wheel(residualDelta), true, `${label} consumes residual wheel events`);
        assert.equal(app.getPendingTweenCount(), 1, `${label} never queues a second tween`);
      }

      app.flush();
      assert.equal(app.scroller.scrollTop, boundary.next, `${label} reaches the shared destination`);

      for (const deltaY of profile.deltas.slice(0, -1)) {
        assert.equal(wheel(-deltaY), true, `${label} can reverse immediately after onComplete`);
        assert.equal(app.scroller.scrollTop, boundary.next);
        assert.equal(app.getPendingTweenCount(), 0);
      }
      assert.equal(wheel(-profile.deltas.at(-1)), true);
      assert.equal(app.getPendingTweenCount(), 1, `${label} releases every transition lock`);
      app.flush();
      assert.equal(app.scroller.scrollTop, boundary.previous, `${label} returns through the same effect`);
      app.cleanup();
      assert.equal(app.clock.pending(), 0);
    }
  }
});

test("boundary intent resets after idle or a native direction reversal", () => {
  const app = setup();
  const wheel = createWheelDriver(app);
  placeAtContentBoundary(app, "featured-projects", 5000);
  app.controller.featuredProjectExpansionProgress[0].set(1);

  assert.equal(wheel(20), true);
  app.clock.advance(180);
  assert.equal(wheel(20), true);
  assert.equal(app.getPendingTweenCount(), 0, "Idle time starts a fresh gesture");
  assert.equal(wheel(12), true);
  assert.equal(app.getPendingTweenCount(), 1);
  app.flush();

  assert.equal(wheel(-20), true);
  assert.equal(wheel(8), false, "Changing direction into the panel returns to native scroll");
  assert.equal(app.scroller.scrollTop, 5808);
  app.scroller.scrollTop = 5800;
  app.handlers.scroll();
  assert.equal(wheel(-12), true);
  assert.equal(app.getPendingTweenCount(), 0, "Old downward intent was discarded");
  assert.equal(wheel(-20), true);
  assert.equal(app.getPendingTweenCount(), 1);
  app.cleanup();
});

test("returning to an image project restores fullscreen before contraction", () => {
  const app = setup();
  const wheel = createWheelDriver(app);
  placeAtContentBoundary(app, "featured-projects", 5000);
  app.controller.featuredProjectExpansionProgress[0].set(1);

  for (const deltaY of [8, 8, 8, 8]) wheel(deltaY);
  app.flush();
  assert.equal(app.scroller.scrollTop, 5800);
  assert.equal(app.getActiveFeaturedProject(), 1);

  for (const deltaY of [-8, -8, -8, -8]) wheel(deltaY);
  app.flush();
  assert.equal(app.scroller.scrollTop, 5000);
  assert.equal(app.getActiveFeaturedProject(), 0);
  assert.equal(app.getFeaturedExpansionProgress(0), 1);

  assert.equal(wheel(-320), true);
  assert.equal(app.getFeaturedExpansionProgress(0), 0.6);
  assert.equal(app.getPendingTweenCount(), 0);
  assert.equal(wheel(160), true);
  assert.equal(app.getFeaturedExpansionProgress(0), 0.8);
  assert.equal(wheel(-640), true);
  assert.equal(app.getFeaturedExpansionProgress(0), 0);
  assert.equal(wheel(-8), false, "Native upward scroll resumes after the card is restored");
  assert.equal(app.scroller.scrollTop, 4992);
  app.cleanup();
});

test("Services continues with native scroll into Quinta", () => {
  const app = setup();
  const wheel = createWheelDriver(app);
  placeAtContentBoundary(app, "services", 3600);

  assert.equal(wheel(8), false);
  assert.equal(app.scroller.scrollTop, 3608);
  assert.equal(app.getPendingTweenCount(), 0);
  app.cleanup();
});

test("reduced motion bypasses scrub without trapping navigation", () => {
  const app = setup(true);
  const wheel = createWheelDriver(app);
  placeAtContentBoundary(app, "featured-projects", 5000);
  assert.equal(wheel(80), false);
  assert.equal(app.getFeaturedExpansionProgress(0), 0);
  app.cleanup();
});

test("touch and keyboard drive the same image expansion progress", () => {
  const touchApp = setup();
  placeAtContentBoundary(touchApp, "featured-projects", 5000);
  touchApp.handlers.pointerdown({
    pointerType: "touch",
    isPrimary: true,
    pointerId: 7,
    clientX: 200,
    clientY: 400,
  });
  let prevented = false;
  touchApp.handlers.pointermove({
    pointerId: 7,
    clientX: 200,
    clientY: 240,
    preventDefault() { prevented = true; },
  });
  assert.equal(prevented, true);
  assert.equal(touchApp.getFeaturedExpansionProgress(0), 0.2);
  touchApp.handlers.pointermove({
    pointerId: 7,
    clientX: 200,
    clientY: 320,
    preventDefault() {},
  });
  assert.equal(touchApp.getFeaturedExpansionProgress(0), 0.1);
  touchApp.cleanup();

  const keyboardApp = setup();
  placeAtContentBoundary(keyboardApp, "featured-projects", 5000);
  keyboardApp.handlers.keydown({ key: "PageDown", preventDefault() {} });
  assert.equal(keyboardApp.getFeaturedExpansionProgress(0), 1);
  assert.equal(keyboardApp.getPendingTweenCount(), 0);
  keyboardApp.handlers.keydown({ key: "ArrowUp", preventDefault() {} });
  assert.equal(keyboardApp.getFeaturedExpansionProgress(0), 0.95);
  keyboardApp.cleanup();
});
