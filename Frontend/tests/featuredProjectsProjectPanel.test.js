import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panelSource = readFileSync(
  new URL(
    "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsProjectPanel.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("Muelle Zulima uses the continuous featured-project flow and shared gallery", () => {
  assert.match(panelSource, /data-featured-next-project/);
  assert.match(panelSource, /data-navbar-background="light"/);
  assert.match(panelSource, /<SectionTitleReveal/);
  assert.match(panelSource, /visible=\{active\}/);
  assert.match(panelSource, /Muelle Zulima/);
  assert.match(panelSource, /<FeaturedProjectsGallery/);
  assert.match(panelSource, /backgroundClassName="bg-\[var\(--color-neutral-100-uniform\)\]"/);
  assert.match(panelSource, /columns=\{MUELLE_ZULIMA_COLUMNS\}/);
  assert.match(panelSource, /muelle-zulima-6\.webp/);
});
