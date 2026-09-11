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
  assert.match(gallerySource, /<LayoutGroup id="featured-projects-gallery">/);
  assert.match(gallerySource, /layoutId=\{`featured-project-image-\$\{image\.id\}`\}/);
  assert.match(gallerySource, /<FeaturedProjectsImageContent \{\.\.\.image\} \/>/);
  assert.match(gallerySource, /COLUMNS\.map\(\(cards, column\)/);
  assert.match(gallerySource, /cards\.map\(\(image, row\)/);
  assert.match(gallerySource, /onClick=\{onClose\}/);
  assert.match(gallerySource, /event\.key === "Escape"/);
  assert.match(gallerySource, /onExitComplete/);
  assert.doesNotMatch(gallerySource, /addEventListener\("scroll"/);
  assert.doesNotMatch(gallerySource, /useMotionValue|useSpring|useTransform/);
});
