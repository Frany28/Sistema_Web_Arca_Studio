import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { HOME_SCROLL_PHASES } from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";

const openingHomeSource = readFileSync(
  new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
  "utf8",
);
const contactSectionSource = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactSection.jsx",
    import.meta.url,
  ),
  "utf8",
);
const contactTiltCardSource = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactTiltCard.jsx",
    import.meta.url,
  ),
  "utf8",
);
const contactTiltCardStyles = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactTiltCard.css",
    import.meta.url,
  ),
  "utf8",
);
const footerSource = readFileSync(
  new URL(
    "../src/components/ui/FooterSection/FooterSection.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("Contact is the final Home section and participates in shared navigation", () => {
  const aboutPosition = openingHomeSource.indexOf("<AboutSection");
  const contactPosition = openingHomeSource.indexOf("<ContactSection");

  assert.ok(aboutPosition >= 0);
  assert.ok(contactPosition > aboutPosition);
  assert.match(contactSectionSource, /<section\s+[\s\S]*?id="contact"/);
  assert.match(openingHomeSource, /"#contact"/);
  assert.match(openingHomeSource, /onContact=\{navigateToContact\}/);
  assert.match(openingHomeSource, /navigateToSection\("contact"\)/);
  assert.match(contactSectionSource, /onNavChange=\{handleFooterNavigation\}/);
});

test("the public CTA Footer presentation is additive and reuses the UI system", () => {
  assert.match(footerSource, /presentation = "default"/);
  assert.match(footerSource, /presentation === "publicCta"/);
  assert.match(footerSource, /<PublicCtaFooter/);
  assert.match(footerSource, /<MainLogo/);
  assert.match(footerSource, /<HorizontalTabMenu/);
  assert.match(footerSource, /<Button/);
  assert.match(footerSource, /<Input/);
  assert.match(footerSource, /onSubscribeClick/);
  assert.match(contactSectionSource, /presentation="publicCta"/);
});

test("Contact preserves the Home phases and owns no scroll interception", () => {
  assert.deepEqual(HOME_SCROLL_PHASES, {
    IMAGE: "image",
    TITLE: "title",
    EFFECT: "effect",
  });
  assert.doesNotMatch(contactSectionSource, /ScrollTrigger|data-home-panel|data-about-story/);
  assert.doesNotMatch(contactTiltCardSource, /ScrollTrigger|addEventListener\("wheel"|preventDefault|stopPropagation/);
});

test("the card disables tilt and gradient motion for reduced motion", () => {
  assert.match(contactTiltCardSource, /useReducedMotion/);
  assert.match(contactTiltCardSource, /if \(reduceMotion\) return undefined/);
  assert.match(contactTiltCardStyles, /prefers-reduced-motion: reduce/);
  assert.match(contactTiltCardStyles, /animation: none/);
});

test("the exact Figma logo vectors are stored locally", () => {
  for (const asset of ["mark.svg", "registration.svg", "date.svg"]) {
    assert.equal(
      existsSync(
        new URL(
          `../src/assets/logos/secondaryLogoParts/${asset}`,
          import.meta.url,
        ),
      ),
      true,
    );
  }

  assert.doesNotMatch(contactTiltCardSource, /figma\.com\/api\/mcp\/asset/);
});
