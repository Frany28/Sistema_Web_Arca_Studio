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

test("the featured-project gallery expands every masonry image from its original position", () => {
  assert.match(gallerySource, /const \[activeImage, setActiveImage\] = useState\(null\)/);
  assert.match(gallerySource, /const \[sourceRect, setSourceRect\] = useState\(null\)/);
  assert.match(gallerySource, /const \[expandedRect, setExpandedRect\] = useState\(null\)/);
  assert.match(gallerySource, /const \[isClosing, setIsClosing\] = useState\(false\)/);
  assert.match(gallerySource, /function getExpandedImageRect\(image\)/);
  assert.match(gallerySource, /availableWidth \/ naturalWidth/);
  assert.match(gallerySource, /availableHeight \/ naturalHeight/);
  assert.match(gallerySource, /function getRectAnimation\(rect\)/);
  assert.match(gallerySource, /triggerRefs\.current\.get\(image\.id\)\?\.getBoundingClientRect\(\)/);
  assert.match(gallerySource, /setExpandedRect\(getExpandedImageRect\(image\)\)/);
  assert.match(gallerySource, /<FeaturedProjectsImageContent \{\.\.\.image\} \/>/);
  assert.match(gallerySource, /columns\.map\(\(cards, column\)/);
  assert.match(gallerySource, /columns = COLUMNS/);
  assert.match(gallerySource, /galleryLabel = "Galería de Quinta Bella Vista"/);
  assert.match(gallerySource, /cards\.map\(\(image, row\)/);
  assert.match(gallerySource, /grid-rows-\[568fr_336fr\]/);
  assert.match(gallerySource, /grid-rows-\[335fr_569fr\]/);
  assert.match(gallerySource, /reduceMotion=\{reduceMotion\}/);
  assert.match(gallerySource, /initial=\{reduceMotion \? expandedAnimation : sourceAnimation\}/);
  assert.match(gallerySource, /animate=\{isClosing \? sourceAnimation : expandedAnimation\}/);
  assert.match(gallerySource, /duration: 1\.25/);
  assert.match(gallerySource, /bounce: 0/);
  assert.match(gallerySource, /backdropFilter: "var\(--effect-blur-b1\)"/);
  assert.match(gallerySource, /createPortal\(activeImage, document\.body\)/);
  assert.match(gallerySource, /className="fixed inset-0 z-\[60\]/);
  assert.match(gallerySource, /onClick=\{onClose\}/);
  assert.match(gallerySource, /event\.key === "Escape"/);
  assert.match(gallerySource, /if \(isClosing\) onCloseComplete\(\)/);
  assert.doesNotMatch(gallerySource, /LayoutGroup|layoutId/);
  assert.doesNotMatch(gallerySource, /addEventListener\("scroll"/);
  assert.doesNotMatch(gallerySource, /useMotionValue|useSpring|useTransform/);
});
