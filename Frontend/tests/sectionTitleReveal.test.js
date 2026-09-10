import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getSectionRevealClip, getSectionRevealTransition } from "../src/pages/publicSite/utils/sectionReveal.js";

const read = (path) => readFileSync(new URL(`../src/pages/publicSite/${path}`, import.meta.url), "utf8");

test("section headings share the hero reveal and replay on viewport reentry", () => {
  const shared = read("components/SectionTitleReveal.jsx");
  for (const path of ["services/components/ServicesHeading.jsx", "featuredProjects/components/FeaturedProjectsSection.jsx"]) {
    assert.match(read(path), /<SectionTitleReveal/);
    assert.doesNotMatch(read(path), /SplitText|whileInView/);
  }
  for (const source of [shared, read("home/components/HomeHeroTitle/HomeHeroTitle.jsx")]) {
    assert.match(source, /getSectionRevealTransition\(visible, reduceMotion\)/);
    assert.match(source, /getSectionRevealClip\(visible\)/);
  }
  assert.match(shared, /useInView\(ref, \{ amount: 0\.2 \}\)/);
  assert.doesNotMatch(shared, /once: true/);
  assert.match(shared, /Boolean\(reduceMotion\) \|\| inView/);
});

test("the shared mask opens and closes with the same spring, with no reduced-motion delay", () => {
  assert.equal(getSectionRevealClip(false), "inset(0 0 100% 0)");
  assert.equal(getSectionRevealClip(true), "inset(0 0 0 0)");
  assert.deepEqual(getSectionRevealTransition(true, false), {
    type: "spring", duration: 0.9, bounce: 0.12, delay: 0.1,
  });
  assert.equal(getSectionRevealTransition(false, false).delay, 0);
  assert.deepEqual(getSectionRevealTransition(true, true), { duration: 0 });
});
