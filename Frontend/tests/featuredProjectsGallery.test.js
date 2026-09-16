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

test("the central image scrubs from its measured card to the viewport", () => {
  assert.match(gallerySource, /getBoundingClientRect\(\)/);
  assert.match(gallerySource, /window\.innerWidth/);
  assert.match(gallerySource, /window\.innerHeight/);
  assert.match(gallerySource, /expansionProgress\.on\("change"/);
  assert.match(gallerySource, /interpolate\(primaryRect\.left, 0, progress\)/);
  assert.match(gallerySource, /interpolate\(primaryRect\.top, 0, progress\)/);
  assert.match(gallerySource, /interpolate\(primaryRect\.width, viewportWidth, progress\)/);
  assert.match(gallerySource, /interpolate\(primaryRect\.height, viewportHeight, progress\)/);
  assert.match(gallerySource, /interpolate\(borderRadius, 0, progress\)/);
  assert.match(gallerySource, /createPortal\(overlay, document\.body\)/);
  assert.match(gallerySource, /object-fit|fit = "cover"/);
  assert.match(gallerySource, /ResizeObserver/);
  assert.match(gallerySource, /orientationchange/);
});

test("secondary images leave progressively while the fullscreen layer stays non-interactive", () => {
  assert.match(gallerySource, /SECONDARY_EXIT_PROGRESS/);
  assert.match(gallerySource, /card\.style\.opacity/);
  assert.match(gallerySource, /translate3d/);
  assert.match(gallerySource, /pointer-events-none fixed z-\[55\]/);
  assert.match(gallerySource, /aria-hidden="true"/);
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
