import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contentSource = readFileSync(
  new URL("../src/pages/publicSite/processes/processesContent.js", import.meta.url),
  "utf8",
);
const gridSource = readFileSync(
  new URL(
    "../src/pages/publicSite/processes/components/ProcessesVideoGrid.jsx",
    import.meta.url,
  ),
  "utf8",
);
const modalSource = readFileSync(
  new URL(
    "../src/pages/publicSite/processes/components/ProcessesVideoModal.jsx",
    import.meta.url,
  ),
  "utf8",
);
const sectionSource = readFileSync(
  new URL(
    "../src/pages/publicSite/processes/components/ProcessesSection.jsx",
    import.meta.url,
  ),
  "utf8",
);
const homeSource = readFileSync(
  new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
  "utf8",
);
const headerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/components/PublicSiteHeader/PublicSiteHeader.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("process videos preserve the supplied order and optimized fallbacks", () => {
  assert.equal(contentSource.match(/id: "/g)?.length, 9);
  assert.equal(contentSource.match(/\.webm";/g)?.length, 9);
  assert.equal(contentSource.match(/\.mp4";/g)?.length, 9);
  assert.equal(contentSource.match(/-poster\.webp";/g)?.length, 9);
  assert.match(contentSource, /brick-facade[\s\S]*surface-preparation[\s\S]*wall-finishing/);
  assert.match(contentSource, /site-inspection[\s\S]*material-preparation[\s\S]*plan-review/);
  assert.match(contentSource, /installation-detail[\s\S]*material-selection[\s\S]*site-cleanup/);
});

test("process grid autoplays without distorting its Figma proportions", () => {
  assert.match(gridSource, /aspect-\[23\/27\]/);
  assert.match(gridSource, /min-\[1024px\]:grid-cols-3/);
  assert.match(gridSource, /autoPlay/);
  assert.match(gridSource, /loop/);
  assert.match(gridSource, /muted/);
  assert.match(gridSource, /playsInline/);
  assert.match(gridSource, /object-cover/);
  assert.match(gridSource, /type="video\/webm"/);
  assert.match(gridSource, /type="video\/mp4"/);
});

test("process section reuses navigation, title reveal and the shared modal", () => {
  assert.match(sectionSource, /id="process"/);
  assert.match(sectionSource, /<SectionTitleReveal/);
  assert.match(sectionSource, /data-content-title-scope="process"/);
  assert.match(sectionSource, /visible=\{titleVisible\}/);
  assert.doesNotMatch(sectionSource, /enabled=\{active\}/);
  assert.match(homeSource, /<ProcessesSection/);
  assert.match(homeSource, /active=\{activeSectionId === "process"\}/);
  assert.match(homeSource, /"#process"/);
  assert.match(headerSource, /\{ id: "process", label: "Nuestros Procesos" \}/);
  assert.match(modalSource, /<Modal/);
  assert.match(modalSource, /mount="viewport"/);
  assert.match(modalSource, /transitionPreset="fade-scale"/);
  assert.match(modalSource, /controls/);
});
