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
const statementPanelSource = readFileSync(
  new URL(
    "../src/components/ui/HomeStatementPanel/HomeStatementPanel.jsx",
    import.meta.url,
  ),
  "utf8",
);
const servicesHeadingSource = readFileSync(
  new URL(
    "../src/components/ui/HomeServicesHeading/HomeServicesHeading.jsx",
    import.meta.url,
  ),
  "utf8",
);
const openingSequenceSource = readFileSync(
  new URL("../src/hooks/useHomeOpeningSequence.js", import.meta.url),
  "utf8",
);
const scrollControllerSource = readFileSync(
  new URL("../src/hooks/useHomeScrollController.js", import.meta.url),
  "utf8",
);
const statementControllerSource = readFileSync(
  new URL(
    "../src/hooks/homeScroll/createHomeStatementController.js",
    import.meta.url,
  ),
  "utf8",
);
const homeContentSource = readFileSync(
  new URL("../src/pages/openingHome/homeContent.js", import.meta.url),
  "utf8",
);
const homeSectionsSource = readFileSync(
  new URL(
    "../src/pages/openingHome/components/HomeSections.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("the root route presents the animated ARCA opening before the home hero", () => {
  assert.match(mainSource, /path="\/" element={<OpeningHome \/>}/);
  assert.match(openingSequenceSource, /motionDurationSeconds \* 1000/);
  assert.match(openingSequenceSource, /Promise\.allSettled/);
  assert.match(openingSequenceSource, /imageSources\.map\(preloadImage\)/);
  assert.match(openingSequenceSource, /document\.fonts\?\.ready/);
  assert.match(homeContentSource, /arca-home-hero\.png/);
  assert.match(homeContentSource, /arca-construction-worker-v2\.png/);
  assert.match(homeSource, /HOME_PRELOAD_IMAGES/);
  assert.match(homeSource, /<HomeHeader/);
  assert.match(homeContentSource, /title: "Arquitectura"/);
  assert.match(homeContentSource, /title: "Construcci.n"/);
  assert.match(homeContentSource, /title: "Interiorismo"/);
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
  assert.match(markSource, /h-\[177\.8px\] w-\[187\.5px\]/);
  assert.match(markSource, /origin-top-left scale-75/);
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
  assert.match(heroTitleSource, /onAnimationComplete/);
  assert.match(heroTitleSource, /onRevealComplete\?\.\(\)/);
  assert.doesNotMatch(heroTitleSource, /visible \|\| reduceMotion/);
});

test("initial scrolling unlocks only after Arquitectura finishes revealing", () => {
  assert.match(homeSource, /initialScrollReady/);
  assert.match(
    homeSource,
    /enabled: phase === "complete" && initialScrollReady/,
  );
  assert.match(
    homeSource,
    /initialScrollReady \? "overflow-y-auto" : "overflow-y-hidden"/,
  );
  assert.match(
    homeSectionsSource,
    /panelIndex === 0 \? onInitialTitleReveal : undefined/,
  );
  assert.match(openingSequenceSource, /setInitialScrollReady\(true\)/);
  assert.match(homeSource, /tabIndex=\{initialScrollReady \? 0 : -1\}/);
});

test("all home inputs use the shared image and title navigation state", () => {
  assert.match(scrollControllerSource, /gsap\.registerPlugin\(ScrollToPlugin\)/);
  assert.doesNotMatch(scrollControllerSource, /ScrollTrigger|pinSpacing|data-home-scroll-step/);
  assert.match(scrollControllerSource, /getNextHomeScrollState/);
  assert.match(scrollControllerSource, /createScrollbarHomeScrollState/);
  assert.match(homeSectionsSource, /navigationState\.panelIndex === panelIndex/);
  assert.match(homeSectionsSource, /navigationState\.phase === HOME_SCROLL_PHASES\.TITLE/);
  assert.match(scrollControllerSource, /SCROLL_STEP_DURATION_SECONDS = 0\.5/);
  assert.match(scrollControllerSource, /if \(reduceMotion\) \{/);
  assert.match(scrollControllerSource, /scroller\.scrollTop = targetScrollTop/);
  assert.match(scrollControllerSource, /duration: SCROLL_STEP_DURATION_SECONDS/);
  assert.doesNotMatch(scrollControllerSource, /dataset\.homeStepHoldMs|setTimeout\(releaseScroll/);

  assert.match(scrollControllerSource, /scroller\.addEventListener\("wheel", handleWheel/);
  assert.match(scrollControllerSource, /normalizeWheelDelta\(event, scroller\.clientHeight\)/);
  assert.match(scrollControllerSource, /WHEEL_GESTURE_THRESHOLD_PX = 32/);
  assert.match(scrollControllerSource, /WHEEL_GESTURE_IDLE_MS = 180/);
  assert.match(scrollControllerSource, /limitHomeStatementWheelDelta\(delta\.y\)/);
  assert.doesNotMatch(
    scrollControllerSource,
    /statement\.queueDelta\(wheelGestureState\.accumulator\)/,
  );

  assert.match(scrollControllerSource, /scroller\.addEventListener\("pointerdown"/);
  assert.match(scrollControllerSource, /scroller\.addEventListener\("pointermove"/);
  assert.match(scrollControllerSource, /TOUCH_SWIPE_THRESHOLD_PX = 48/);
  assert.match(scrollControllerSource, /TOUCH_VERTICAL_DOMINANCE = 1\.2/);
  assert.match(homeSource, /touch-pan-x/);

  assert.match(scrollControllerSource, /scroller\.addEventListener\("keydown"/);
  assert.match(scrollControllerSource, /getKeyboardDirection\(event\)/);
  assert.match(scrollControllerSource, /event\.repeat/);
  assert.match(scrollControllerSource, /isInteractiveTarget\(event\.target\)/);

  assert.match(scrollControllerSource, /"onscrollend" in scroller/);
  assert.match(scrollControllerSource, /SCROLL_SETTLE_DELAY_MS = 180/);
  assert.match(scrollControllerSource, /getNearestPanelIndex/);
  assert.match(scrollControllerSource, /window\.addEventListener\("resize", handleResize\)/);
  assert.match(scrollControllerSource, /window\.addEventListener\("orientationchange", handleResize\)/);

  assert.match(homeSectionsSource, /HOME_IMAGE_PANELS\.map/);
  assert.match(homeSectionsSource, /<HomeScrollPanel/);
  assert.match(scrollPanelSource, /relative h-dvh/);
  assert.match(scrollPanelSource, /titleVisible = false/);
  assert.match(scrollPanelSource, /visible=\{titleVisible\}/);
  assert.doesNotMatch(scrollPanelSource, /useInView|revealOnNextScroll|h-\[200dvh\]/);
  assert.match(homeSource, /overscroll-y-contain/);
  assert.match(homeSource, /tabIndex=\{initialScrollReady \? 0 : -1\}/);
  assert.doesNotMatch(scrollControllerSource, /setInterval/);
});

test("the final home panel scrubs a responsive video statement", () => {
  assert.match(scrollControllerSource, /STATEMENT_PANEL_INDEX = 3/);
  assert.match(homeContentSource, /Pi.nsalo y lo hacemos realidad\./);
  assert.match(homeContentSource, /arca-statement-bg\.mp4/);
  assert.match(homeContentSource, /arca-statement-bg\.webm/);
  assert.match(homeContentSource, /arca-statement-poster\.webp/);
  assert.match(homeSectionsSource, /<HomeStatementPanel/);
  assert.match(statementControllerSource, /queueDelta/);
  assert.match(statementControllerSource, /window\.requestAnimationFrame/);
  assert.match(statementControllerSource, /advanceHomeStatementProgress/);
  assert.match(statementControllerSource, /STATEMENT_KEYBOARD_DURATION_SECONDS = 0\.35/);
  assert.match(scrollControllerSource, /createScrollbarHomeScrollState\(panelIndex\)/);
  assert.doesNotMatch(scrollControllerSource, /pendingStatementEntryDelta/);

  assert.match(statementPanelSource, /data-home-statement-panel/);
  assert.match(statementPanelSource, /autoPlay/);
  assert.match(statementPanelSource, /muted/);
  assert.match(statementPanelSource, /loop/);
  assert.match(statementPanelSource, /playsInline/);
  assert.match(statementPanelSource, /video\.defaultMuted = true/);
  assert.match(statementPanelSource, /addEventListener\("canplay"/);
  assert.match(statementPanelSource, /playMutedVideo\(video\)/);
  assert.match(statementPanelSource, /if \(!active\) \{/);
  assert.match(statementPanelSource, /video\.currentTime = 0/);
  assert.match(statementPanelSource, /\[active, mediaEnabled\]/);
  assert.doesNotMatch(scrollControllerSource, /restartStatementPlayback/);
  assert.doesNotMatch(homeSectionsSource, /playbackVersion/);
  assert.match(statementPanelSource, /preload=\{mediaEnabled \? "auto" : "none"\}/);
  assert.match(statementPanelSource, /<source src=\{webmSource\}/);
  assert.match(statementPanelSource, /<source src=\{mp4Source\}/);
  assert.match(statementPanelSource, /<mask/);
  assert.match(statementPanelSource, /<Motion\.text/);
  assert.match(statementPanelSource, /effectStarted \? "visible" : "invisible"/);
  assert.match(
    homeSectionsSource,
    /navigationState\.phase !== HOME_SCROLL_PHASES\.IMAGE/,
  );
  assert.match(statementPanelSource, /STATEMENT_FOCUS_LETTER = "c"/);
  assert.match(statementPanelSource, /STATEMENT_FOCUS_GLYPH_HORIZONTAL_RATIO = 0\.2/);
  assert.match(statementPanelSource, /focusGlyph\.getBBox\(\)/);
  assert.match(statementPanelSource, /focusOffsetX\.set/);
  assert.match(statementPanelSource, /<Motion\.g style=\{\{ x: maskTranslateX \}\}>/);
  assert.match(statementPanelSource, /opacity-20 mix-blend-multiply/);
  assert.doesNotMatch(statementPanelSource, /overlayOpacity/);
  assert.match(statementPanelSource, /useSpring\(progress/);
  assert.match(statementPanelSource, /stiffness: 180/);
  assert.match(statementPanelSource, /reduceMotion \? progress : smoothedProgress/);
  assert.match(statementPanelSource, /text-\[clamp\(24px,3\.2vw,46px\)\]/);
  assert.match(statementPanelSource, /aria-hidden=\{!active\}/);
  assert.match(statementPanelSource, /aria-hidden=\{!statementVisible\}/);
});

test("services navigation opens the responsive Figma heading and its reveal", () => {
  assert.match(homeContentSource, /Soluciones adaptadas a cada proyecto\./);
  assert.match(homeSectionsSource, /<HomeServicesHeading/);
  assert.match(homeSource, /onNavigate=\{\(sectionId\) =>/);
  assert.match(homeSource, /navigateToPanel\(servicesPanelIndex\)/);
  assert.match(homeSource, /activeNavigationId=/);
  assert.match(scrollControllerSource, /SERVICES_PANEL_INDEX = 4/);
  assert.match(scrollControllerSource, /data-home-reveal-on-entry/);
  assert.match(servicesHeadingSource, /data-node-id="4505:113281"/);
  assert.match(servicesHeadingSource, /data-node-id="4505:113282"/);
  assert.match(servicesHeadingSource, /data-node-id="4505:113283"/);
  assert.match(servicesHeadingSource, /data-node-id="4505:113286"/);
  assert.match(servicesHeadingSource, /max-w-\[786px\]/);
  assert.match(servicesHeadingSource, /linear-gradient/);
  assert.match(servicesHeadingSource, /bg-clip-text/);
  assert.match(servicesHeadingSource, /useReducedMotion/);
  assert.match(servicesHeadingSource, /opacity: visible \? 1 : 0/);
});

test("OpeningHome delegates loading, navigation, content and statement behavior", () => {
  assert.ok(homeSource.split("\n").length <= 130);
  assert.match(homeSource, /useHomeOpeningSequence/);
  assert.match(homeSource, /useHomeScrollController/);
  assert.match(homeSource, /<HomeSections/);
  assert.doesNotMatch(
    homeSource,
    /addEventListener|requestAnimationFrame|Promise\.allSettled|gsap\./,
  );
});
