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
  assert.match(homeSource, /document\.fonts\?\.ready/);
  assert.match(homeSource, /arca-home-hero\.png/);
  assert.match(homeSource, /<HomeHeader/);
  assert.match(homeSource, /title="Arquitectura"/);
  assert.match(homeSource, /title="Construcción"/);
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
  assert.doesNotMatch(homeSource, /onClick|onWheel|onScroll|ScrollTrigger/);
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
  assert.match(heroTitleSource, /top-\[clamp\(220px,31\.2dvh,319\.5px\)\]/);
  assert.match(heroTitleSource, /type: "spring"/);
  assert.match(heroTitleSource, /useReducedMotion\(\)/);
});

test("home panels use fluid bidirectional native scrolling", () => {
  assert.match(homeSource, /arca-construction-hero\.png/);
  assert.match(homeSource, /snap-y snap-mandatory/);
  assert.match(homeSource, /<HomeScrollPanel/g);
  assert.equal(homeSource.match(/<HomeScrollPanel/g)?.length, 3);
  assert.match(homeSource, /title="Construcción"\s+showTitle=\{false\}/);
  assert.match(scrollPanelSource, /relative h-dvh/);
  assert.doesNotMatch(scrollPanelSource, /sticky top-0|snap-always/);
  assert.match(scrollPanelSource, /useInView\(panelRef, \{ amount: 0\.6 \}\)/);
  assert.match(scrollPanelSource, /visible=\{enabled && isInView\}/);
  assert.match(scrollPanelSource, /showTitle = true/);
  assert.match(homeSource, /scroll-smooth/);
  assert.match(homeSource, /overscroll-y-contain/);
  assert.match(homeSource, /tabIndex=\{phase === "complete" \? 0 : -1\}/);
  assert.doesNotMatch(homeSource, /setInterval|scrollTo\(/);
});
