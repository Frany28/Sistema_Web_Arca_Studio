import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
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
  const effects = [];
  const frames = [];
  const tweens = [];
  const handlers = {};
  const panels = [0, 800, 1600, 2400].map((offsetTop) => ({ offsetTop }));
  const services = { id: "services", offsetTop: 3200 };
  const scroller = {
    scrollTop: 0, clientHeight: 800,
    querySelectorAll: () => [services],
    addEventListener: (type, handler) => { handlers[type] = handler; },
    removeEventListener: (type) => { delete handlers[type]; },
  };
  const window = {
    requestAnimationFrame: (callback) => { frames.push(callback); return frames.length; },
    cancelAnimationFrame() {}, clearTimeout() {}, setTimeout() {},
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
      ...navigation, gsap, window, ScrollToPlugin: {}, createHomeStatementController,
      Element: class {}, useCallback: (callback) => callback,
      useLayoutEffect: (effect) => effects.push(effect),
      useRef: (current) => ({ current }), useState: (initial) => [initial, () => {}],
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
  return { controller, handlers, scroller, flush, cleanup: () => cleanups.forEach((fn) => fn?.()) };
}

for (const reducedMotion of [false, true]) {
  test(`Services uses continuous scroll and the logo returns to Home (reduced motion: ${reducedMotion})`, () => {
    const app = setup(reducedMotion);
    app.controller.navigateToSection("services");
    app.flush();
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
  app.scroller.scrollTop = 2390;
  app.handlers.scroll();
  app.flush();
  assert.equal(app.scroller.scrollTop, 2400);
  assert.equal(app.controller.statementProgress.get(), 1);
  app.cleanup();
});

for (const input of ["wheel", "keyboard", "touch"]) {
  test(`${input} continues to Services after completing the statement`, () => {
    const app = setup();
    app.controller.navigateToSection("services");
    app.flush();
    app.scroller.scrollTop = 2400;
    app.handlers.scroll();
    app.flush();
    if (input === "wheel") {
      app.handlers.wheel({ deltaY: 80, timeStamp: 1000, preventDefault() {} });
    } else if (input === "keyboard") {
      app.handlers.keydown({ key: "ArrowDown", preventDefault() {} });
    } else {
      app.handlers.pointerdown({ pointerType: "touch", isPrimary: true, pointerId: 1, clientX: 100, clientY: 300 });
      app.handlers.pointermove({ pointerId: 1, clientX: 100, clientY: 200, preventDefault() {} });
    }
    app.flush();
    assert.equal(app.scroller.scrollTop, 3200);
    app.cleanup();
  });
}
