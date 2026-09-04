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
  assert.match(homeSource, /title="Construcción"/);
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

test("the hero title reproduces the Figma masked reveal after the opening", () => {
  assert.match(heroTitleSource, /\{title\}/);
  assert.match(heroTitleSource, /REVEAL_DELAY_SECONDS = 0\.4000000059604645/);
  assert.match(heroTitleSource, /REVEAL_DURATION_SECONDS = 3\.12408709526062/);
  assert.match(heroTitleSource, /REVEAL_HEIGHT_COLLAPSED = 73/);
  assert.match(heroTitleSource, /REVEAL_HEIGHT_EXPANDED = 255/);
  assert.match(heroTitleSource, /top-\[clamp\(160px,41\.6dvh,319\.5px\)\]/);
  assert.match(heroTitleSource, /top-\[clamp\(28px,7\.33dvh,56\.3px\)\]/);
  assert.match(heroTitleSource, /w-\[min\(1104px,calc\(100%-32px\)\)\]/);
  assert.match(heroTitleSource, /leading-\[76px\]/);
  assert.match(heroTitleSource, /type: "spring"/);
  assert.match(heroTitleSource, /useReducedMotion\(\)/);
});

test("GSAP pins each image while the following scroll reveals its title", () => {
  assert.match(homeSource, /arca-construction-hero\.png/);
  assert.match(homeSource, /arca-interior-design-hero\.png/);
  assert.match(homeSource, /pin: visual/);
  assert.match(homeSource, /pinSpacing: false/);
  assert.match(homeSource, /end: "bottom top"/);
  assert.match(homeSource, /gsap\.registerPlugin\(ScrollToPlugin, ScrollTrigger\)/);
  assert.match(homeSource, /scroller\.addEventListener\("wheel", handleWheel/);
  assert.match(homeSource, /moveToStep\(event\.deltaY > 0 \? 1 : -1\)/);
  assert.match(homeSource, /wheelGestureReady = false/);
  assert.match(homeSource, /wheelGestureReady = true/);
  assert.match(homeSource, /direction > 0 && downwardLocked/);
  assert.match(homeSource, /dataset\.homeStepHoldMs/);
  assert.match(homeSource, /context\.revert\(\)/);
  assert.match(homeSource, /<HomeScrollPanel/g);
  assert.equal(homeSource.match(/<HomeScrollPanel/g)?.length, 3);
  assert.match(homeSource, /title="Construcción"\s+revealOnNextScroll/);
  assert.match(homeSource, /title="Interiorismo"\s+revealOnNextScroll/);
  assert.match(scrollPanelSource, /relative h-dvh/);
  assert.match(scrollPanelSource, /relative h-\[200dvh\]/);
  assert.match(scrollPanelSource, /motion-reduce:sticky motion-reduce:top-0/);
  assert.match(scrollPanelSource, /closest\("\[data-home-scroll-container\]"\)/);
  assert.match(scrollPanelSource, /scroller\.addEventListener\("scroll"/);
  assert.match(scrollPanelSource, /panel\.offsetTop \+ scroller\.clientHeight \* 0\.35/);
  assert.match(
    scrollPanelSource,
    /revealOnNextScroll \? titleStepActive : isInView/,
  );
  assert.match(scrollPanelSource, /revealOnNextScroll = false/);
  assert.match(scrollPanelSource, /data-home-scroll-step/);
  assert.match(scrollPanelSource, /data-home-title-step/);
  assert.match(scrollPanelSource, /data-home-step-hold-ms=\{TITLE_STEP_HOLD_MS\}/);
  assert.match(homeSource, /overscroll-y-contain/);
  assert.match(homeSource, /tabIndex=\{phase === "complete" \? 0 : -1\}/);
  assert.doesNotMatch(homeSource, /setInterval|scrollTo\(/);
});
