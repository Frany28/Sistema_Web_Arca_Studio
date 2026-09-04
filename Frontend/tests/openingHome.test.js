import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mainSource = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const homeSource = readFileSync(
  new URL("../src/pages/OpeningHome.jsx", import.meta.url),
  "utf8",
);
const markSource = readFileSync(
  new URL(
    "../src/components/ui/ArcaOpeningMark/ArcaOpeningMark.jsx",
    import.meta.url,
  ),
  "utf8",
);
const heroTitleSource = readFileSync(
  new URL(
    "../src/components/ui/HomeHeroTitle/HomeHeroTitle.jsx",
    import.meta.url,
  ),
  "utf8",
);
const scrollPanelSource = readFileSync(
  new URL(
    "../src/components/ui/HomeScrollPanel/HomeScrollPanel.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("the root route presents the animated ARCA opening before the home hero", () => {
  assert.match(mainSource, /path="\/" element={<OpeningHome \/>}/);
  assert.match(homeSource, /MOTION_DURATION_SECONDS \* 1000/);
  assert.match(homeSource, /Promise\.allSettled/);
  assert.match(homeSource, /preloadImage\(homeHeroAsset\)/);
  assert.match(homeSource, /preloadImage\(constructionHeroAsset\)/);
  assert.match(homeSource, /preloadImage\(interiorDesignHeroAsset\)/);
  assert.match(homeSource, /document\.fonts\?\.ready/);
  assert.match(homeSource, /arca-home-hero\.png/);
  assert.match(homeSource, /<HomeHeader/);
  assert.match(homeSource, /title="Arquitectura"/);
  assert.match(homeSource, /title="Construcci.n"/);
  assert.match(homeSource, /title="Interiorismo"/);
  assert.match(
    homeSource,
    /<ArcaOpeningMark repeat=\{phase === "opening" \? Infinity : 0\} \/>/,
  );
});

test("login is shown only from its dedicated home action", () => {
  assert.match(mainSource, /path="\/login" element={<Login \/>}/);
  assert.match(homeSource, /onLogin=\{\(\) => navigate\("\/login"\)\}/);
  assert.doesNotMatch(homeSource, /<Login \/>/);
});

test("the opening advances automatically as two fixed panels without interaction", () => {
  assert.match(homeSource, /fixed inset-0 overflow-hidden/);
  assert.match(homeSource, /h-\[200dvh\]/);
  assert.match(homeSource, /phase === "opening" \? "0%" : "-50%"/);
  assert.match(homeSource, /\[0\.815, 0\.005, 0\.17, 0\.995\]/);
  assert.doesNotMatch(homeSource, /onClick|onWheel|onScroll/);
});

test("the opening mark preserves the Figma motion timeline and accessibility", () => {
  assert.match(markSource, /const MOTION_DURATION_SECONDS = 3\.679666/);
  assert.match(markSource, /const HIGHLIGHT_WIDTH = MASK_WIDTH/);
  assert.match(markSource, /times: \[0, 0\.0595, 0\.44, 1]/);
  assert.match(markSource, /times: \[0, 0\.275, highlight\.arrival, 1]/);
  assert.match(markSource, /useReducedMotion\(\)/);
  assert.match(markSource, /aria-label="ARCA Studio"/);
  assert.match(markSource, /arca-loader-vector\.svg/);
  assert.match(markSource, /arca-loader-mask\.svg/);
});

test("the hero title keeps its responsive masked reveal", () => {
  assert.match(heroTitleSource, /\{title\}/);
  assert.match(heroTitleSource, /REVEAL_DELAY_SECONDS = 0\.1/);
  assert.match(heroTitleSource, /REVEAL_DURATION_SECONDS = 0\.9/);
  assert.match(heroTitleSource, /REVEAL_HEIGHT_COLLAPSED = 73/);
  assert.match(heroTitleSource, /REVEAL_HEIGHT_EXPANDED = 255/);
  assert.match(heroTitleSource, /top-\[clamp\(160px,41\.6dvh,319\.5px\)\]/);
  assert.match(heroTitleSource, /top-\[clamp\(28px,7\.33dvh,56\.3px\)\]/);
  assert.match(heroTitleSource, /top-\[89\.5px\]/);
  assert.match(heroTitleSource, /w-\[min\(1104px,calc\(100%-32px\)\)\]/);
  assert.match(heroTitleSource, /text-\[clamp\(40px,8vw,96px\)\]/);
  assert.match(heroTitleSource, /leading-\[clamp\(48px,6\.33vw,76px\)\]/);
  assert.match(heroTitleSource, /tracking-\[clamp\(-2px,-0\.139vw,-1px\)\]/);
  assert.match(heroTitleSource, /whitespace-nowrap/);
  assert.match(heroTitleSource, /type: "spring"/);
  assert.match(heroTitleSource, /useReducedMotion\(\)/);
  assert.match(heroTitleSource, /aria-hidden=\{!visible\}/);
  assert.doesNotMatch(heroTitleSource, /visible \|\| reduceMotion/);
});

test("all home inputs use the shared image and title navigation state", () => {
  assert.match(homeSource, /gsap\.registerPlugin\(ScrollToPlugin\)/);
  assert.doesNotMatch(homeSource, /ScrollTrigger|pinSpacing|data-home-scroll-step/);
  assert.match(homeSource, /getNextHomeScrollState/);
  assert.match(homeSource, /createScrollbarHomeScrollState/);
  assert.match(homeSource, /navigationState\.panelIndex === 0/);
  assert.match(homeSource, /navigationState\.panelIndex === 1/);
  assert.match(homeSource, /navigationState\.panelIndex === 2/);
  assert.equal(
    homeSource.match(/navigationState\.phase === HOME_SCROLL_PHASES\.TITLE/g)
      ?.length,
    3,
  );
  assert.match(homeSource, /SCROLL_STEP_DURATION_SECONDS = 0\.5/);
  assert.match(homeSource, /if \(reduceMotion\) \{/);
  assert.match(homeSource, /scroller\.scrollTop = targetScrollTop/);
  assert.match(homeSource, /duration: SCROLL_STEP_DURATION_SECONDS/);
  assert.doesNotMatch(homeSource, /dataset\.homeStepHoldMs|setTimeout\(releaseScroll/);

  assert.match(homeSource, /scroller\.addEventListener\("wheel", handleWheel/);
  assert.match(homeSource, /normalizeWheelDelta\(event, scroller\.clientHeight\)/);
  assert.match(homeSource, /WHEEL_GESTURE_THRESHOLD_PX = 32/);
  assert.match(homeSource, /WHEEL_GESTURE_IDLE_MS = 180/);

  assert.match(homeSource, /scroller\.addEventListener\("pointerdown"/);
  assert.match(homeSource, /scroller\.addEventListener\("pointermove"/);
  assert.match(homeSource, /TOUCH_SWIPE_THRESHOLD_PX = 48/);
  assert.match(homeSource, /TOUCH_VERTICAL_DOMINANCE = 1\.2/);
  assert.match(homeSource, /touch-pan-x/);

  assert.match(homeSource, /scroller\.addEventListener\("keydown"/);
  assert.match(homeSource, /getKeyboardDirection\(event\)/);
  assert.match(homeSource, /event\.repeat/);
  assert.match(homeSource, /isInteractiveTarget\(event\.target\)/);

  assert.match(homeSource, /"onscrollend" in scroller/);
  assert.match(homeSource, /SCROLL_SETTLE_DELAY_MS = 180/);
  assert.match(homeSource, /getNearestPanelIndex/);
  assert.match(homeSource, /window\.addEventListener\("resize", handleResize\)/);
  assert.match(homeSource, /window\.addEventListener\("orientationchange", handleResize\)/);

  assert.equal(homeSource.match(/<HomeScrollPanel/g)?.length, 3);
  assert.match(scrollPanelSource, /relative h-dvh/);
  assert.match(scrollPanelSource, /titleVisible = false/);
  assert.match(scrollPanelSource, /visible=\{titleVisible\}/);
  assert.doesNotMatch(scrollPanelSource, /useInView|revealOnNextScroll|h-\[200dvh\]/);
  assert.match(homeSource, /overscroll-y-contain/);
  assert.match(homeSource, /tabIndex=\{phase === "complete" \? 0 : -1\}/);
  assert.doesNotMatch(homeSource, /setInterval/);
});
