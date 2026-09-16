import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const homeControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/useHomeScrollController.js",
    import.meta.url,
  ),
  "utf8",
);
const openingHomeSource = readFileSync(
  new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
  "utf8",
);
const sectionSource = readFileSync(
  new URL(
    "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsSection.jsx",
    import.meta.url,
  ),
  "utf8",
);
const removedPanelLoopPath = new URL(
  "../src/pages/publicSite/featuredProjects/hooks/useFeaturedProjectsPanelLoop.js",
  import.meta.url,
);

test("Home is the only global owner of featured-project vertical navigation", () => {
  assert.equal(existsSync(removedPanelLoopPath), false);
  assert.doesNotMatch(sectionSource, /useFeaturedProjectsPanelLoop/);
  assert.match(
    homeControllerSource,
    /scroller\.addEventListener\("wheel", handleWheel, \{ passive: false, capture: true \}\)/,
  );
  assert.match(homeControllerSource, /FEATURED_PROJECT_SELECTOR/);
  assert.match(homeControllerSource, /getFeaturedProjectTransition/);
  assert.match(homeControllerSource, /transitionFeaturedProject/);
});

test("featured-project transitions reuse the Home ScrollTo motion", () => {
  assert.match(
    homeControllerSource,
    /scrollTo: \{\s*y: transition\.scrollTop,\s*autoKill: false,?\s*\}/,
  );
  assert.match(homeControllerSource, /duration: SCROLL_STEP_DURATION_SECONDS/);
  assert.match(homeControllerSource, /ease: SECTION_NAVIGATION_EASE/);
  assert.match(homeControllerSource, /if \(reduceMotion\)/);
  assert.match(
    homeControllerSource,
    /commitFeaturedProjectIndex\(transition\.index\);[\s\S]*synchronizeContentScroll\(\)/,
  );
});

test("the active project state flows from Home into the visual section", () => {
  assert.match(openingHomeSource, /activeFeaturedProjectIndex/);
  assert.match(
    openingHomeSource,
    /activeProjectIndex=\{activeFeaturedProjectIndex\}/,
  );
  assert.match(sectionSource, /activeProjectIndex = 0/);
  assert.match(sectionSource, /activeProjectIndex === 0/);
  assert.match(sectionSource, /activeProjectIndex === 1/);
  assert.match(sectionSource, /activeProjectIndex === 2/);
});

test("featured projects remain in their required visual order", () => {
  const quintaIndex = sectionSource.indexOf("Quinta Bella Vista");
  const muelleIndex = sectionSource.indexOf("activeProjectIndex === 1");
  const aptoIndex = sectionSource.indexOf("activeProjectIndex === 2");

  assert.ok(quintaIndex >= 0);
  assert.ok(muelleIndex > quintaIndex);
  assert.ok(aptoIndex > muelleIndex);
});
