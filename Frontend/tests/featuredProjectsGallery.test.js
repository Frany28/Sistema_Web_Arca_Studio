import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const gallerySource = readFileSync(
  new URL(
    "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsGallery.jsx",
    import.meta.url,
  ),
  "utf8",
);
const processGridSource = readFileSync(
  new URL(
    "../src/pages/publicSite/processes/components/ProcessesVideoGrid.jsx",
    import.meta.url,
  ),
  "utf8",
);
const processModalSource = readFileSync(
  new URL(
    "../src/pages/publicSite/processes/components/ProcessesVideoModal.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("image galleries keep their bento layout but are no longer interactive viewers", () => {
  assert.match(gallerySource, /columns\.map\(\(cards, column\)/);
  assert.match(gallerySource, /grid-rows-\[568fr_336fr\]/);
  assert.match(gallerySource, /grid-rows-\[335fr_569fr\]/);
  assert.match(gallerySource, /PRIMARY_CARD_ID = "1-1"/);
  assert.match(gallerySource, /data-featured-image-gallery/);
  assert.doesNotMatch(gallerySource, /<button/);
  assert.doesNotMatch(gallerySource, /onClick=/);
  assert.doesNotMatch(gallerySource, /activeImage|selectedImage|isClosing/);
  assert.doesNotMatch(gallerySource, /role="dialog"|aria-modal/);
});

test("the bento scrubs through a reversible GSAP Flip layout", () => {
  assert.match(gallerySource, /import \{ Flip \} from "gsap\/Flip"/);
  assert.match(gallerySource, /gsap\.registerPlugin\(ExpoScaleEase, Flip\)/);
  assert.match(gallerySource, /getBoundingClientRect\(\)/);
  assert.match(gallerySource, /window\.innerWidth/);
  assert.match(gallerySource, /window\.innerHeight/);
  assert.match(gallerySource, /expansionProgress\.on\("change"/);
  assert.match(gallerySource, /Flip\.getState\(/);
  assert.match(gallerySource, /Flip\.to\(finalState/);
  assert.match(gallerySource, /ease: "expoScale\(1, 5\)"/);
  assert.match(gallerySource, /flipTimelineRef\.current\?\.progress\(progress, false\)/);
  assert.match(gallerySource, /createPortal\(stage, document\.body\)/);
  assert.match(gallerySource, /object-fit|fit = "cover"/);
  assert.match(gallerySource, /ResizeObserver/);
  assert.match(gallerySource, /orientationchange/);
  assert.doesNotMatch(gallerySource, /ScrollTrigger/);
  assert.doesNotMatch(gallerySource, /interpolate\(/);
});

test("secondary images move beyond the viewport while the Flip stage stays non-interactive", () => {
  assert.match(gallerySource, /getSecondaryFinalPosition/);
  assert.match(gallerySource, /left: -rect\.width - gutter/);
  assert.match(gallerySource, /left: viewportWidth \+ gutter/);
  assert.match(gallerySource, /top: rect\.top/);
  assert.match(gallerySource, /top: -rect\.height - gutter/);
  assert.match(gallerySource, /pointer-events-none fixed inset-0 z-\[55\]/);
  assert.match(gallerySource, /aria-hidden="true"/);
  assert.doesNotMatch(gallerySource, /card\.style\.opacity/);
});

test("process videos retain their click and modal behavior", () => {
  assert.match(processGridSource, /<button/);
  assert.match(processGridSource, /onClick=\{\(event\) =>/);
  assert.match(processGridSource, /onVideoOpen\(video/);
  assert.match(processModalSource, /createPortal\(/);
  assert.match(processModalSource, /onClick=\{handleClose\}/);
  assert.match(processModalSource, /autoPlay/);
  assert.match(processModalSource, /<source src=\{video\.webm\}/);
  assert.match(processModalSource, /<source src=\{video\.mp4\}/);
});
