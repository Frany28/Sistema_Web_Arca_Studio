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
const inputControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createInputGestureController.js",
    import.meta.url,
  ),
  "utf8",
);
const panelControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createPanelNavigationController.js",
    import.meta.url,
  ),
  "utf8",
);
const featuredControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createFeaturedProjectsController.js",
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
const gallerySource = readFileSync(
  new URL(
    "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsGallery.jsx",
    import.meta.url,
  ),
  "utf8",
);
const projectPanelSource = readFileSync(
  new URL(
    "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsProjectPanel.jsx",
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
    inputControllerSource,
    /scroller\.addEventListener\("wheel", handleWheel, \{ passive: false, capture: true \}\)/,
  );
  assert.match(featuredControllerSource, /FEATURED_PROJECT_SELECTOR/);
  assert.match(featuredControllerSource, /getProjectTransition/);
  assert.match(featuredControllerSource, /transitionProject/);
  assert.match(homeControllerSource, /createFeaturedProjectsController/);
});

test("featured-project transitions reuse the Home ScrollTo motion", () => {
  assert.match(
    panelControllerSource,
    /scrollTo: \{ y: scrollTop, autoKill: false \}/,
  );
  assert.match(panelControllerSource, /duration: SCROLL_STEP_DURATION_SECONDS/);
  assert.match(panelControllerSource, /ease: SECTION_NAVIGATION_EASE/);
  assert.match(panelControllerSource, /if \(reduceMotion\)/);
  assert.match(
    featuredControllerSource,
    /commitProjectIndex\(transition\.index\);[\s\S]*coordination\.content\.synchronizeContentScroll\(\)/,
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
  assert.match(openingHomeSource, /preparationOffsets=\{featuredProjectPreparationOffsets\}/);
  assert.match(sectionSource, /preparationOffset=\{preparationOffsets\[0\]\}/);
});

test("an incoming image project is prepared before it becomes active", () => {
  assert.match(
    featuredControllerSource,
    /setPreparationOffset\([\s\S]*scroller\.scrollTop - transition\.scrollTop[\s\S]*setExpansionProgress\(transition\.index, 1\);[\s\S]*commitProjectIndex\(transition\.index\);/,
  );
  assert.match(homeControllerSource, /featuredProjectPreparationOffsets/);
});

test("featured projects remain in their required visual order", () => {
  const quintaIndex = sectionSource.indexOf("Quinta Bella Vista");
  const muelleIndex = sectionSource.indexOf("activeProjectIndex === 1");
  const aptoIndex = sectionSource.indexOf("activeProjectIndex === 2");

  assert.ok(quintaIndex >= 0);
  assert.ok(muelleIndex > quintaIndex);
  assert.ok(aptoIndex > muelleIndex);
});

test("only the Services-to-Quinta gallery bypasses the section reveal", () => {
  assert.match(sectionSource, /sectionReveal=\{false\}/);
  assert.match(
    gallerySource,
    /animate=\{sectionReveal \? \{ clipPath: getSectionRevealClip\(visible\) \} : undefined\}/,
  );
  assert.match(
    gallerySource,
    /style=\{sectionReveal \? undefined : \{ clipPath: "inset\(0 0 0 0\)" \}\}/,
  );
  assert.doesNotMatch(projectPanelSource, /sectionReveal=\{false\}/);
  assert.match(featuredControllerSource, /transitionProject/);
});
