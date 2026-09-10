import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const headerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/components/PublicSiteHeader/PublicSiteHeader.jsx",
    import.meta.url,
  ),
  "utf8",
);
const horizontalTabMenuSource = readFileSync(
  new URL(
    "../src/components/ui/HorizontalTabMenu/HorizontalTabMenu.jsx",
    import.meta.url,
  ),
  "utf8",
);
const globalStylesSource = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);
const scrollDirectionVisibilitySource = readFileSync(
  new URL("../src/hooks/useScrollDirectionVisibility.js", import.meta.url),
  "utf8",
);

test("the public home header preserves the Figma structure and labels", () => {
  assert.match(headerSource, /data-node-id="4487:112595"/);
  assert.match(headerSource, /h-\[64px\]/);
  assert.match(headerSource, /max-w-\[1200px\]/);
  assert.match(headerSource, /Servicios/);
  assert.match(headerSource, /Proyectos destacados/);
  assert.match(headerSource, /¿Cómo trabajamos\?/);
  assert.match(headerSource, /Sobre nosotros/);
  assert.doesNotMatch(headerSource, /Registrarse|onRegister|onLogin/);
  assert.match(headerSource, /Contáctanos/);
  assert.match(headerSource, /data-node-id="4781:135050"/);
});

test("the public home header adapts its appearance and reuses shared UI", () => {
  assert.match(headerSource, /appearance=\{backgroundAppearance\}/);
  assert.match(headerSource, /useHeaderBackground\(headerRef, scrollContainerRef\)/);
  assert.match(headerSource, /theme="Primary"/);
  assert.match(headerSource, /type="Solid"/);
  assert.match(headerSource, /backdrop-blur-\[15px\]/);
  assert.match(headerSource, /<Button/);
  assert.match(headerSource, /<HorizontalTabMenu/);
  assert.match(headerSource, /presentation="publicNavigation"/);
  assert.match(headerSource, /style="Underlined"/);
  assert.match(headerSource, /items=\{navigationItems\.map\(\(item\) => item\.label\)\}/);
  assert.match(headerSource, /activeIndex=\{activeNavigationIndex\}/);
  assert.match(headerSource, /onNavigate\?\.\(navigationItems\[index\]\.id\)/);
  assert.doesNotMatch(headerSource, /<ul|<li/);
  assert.doesNotMatch(headerSource, /dark:/);
  assert.doesNotMatch(headerSource, /useEffect|MutationObserver/);
});

test("the public navbar hides while scrolling down and returns while scrolling up", () => {
  assert.match(
    headerSource,
    /useScrollDirectionVisibility\(headerRef, \{ scrollContainerRef \}\)/,
  );
  assert.match(scrollDirectionVisibilitySource, /gsap\.registerPlugin\(ScrollTrigger\)/);
  assert.match(scrollDirectionVisibilitySource, /NAVBAR_SCROLL_DURATION_SECONDS = 0\.2/);
  assert.match(scrollDirectionVisibilitySource, /getClosestScrollContainer/);
  assert.match(
    scrollDirectionVisibilitySource,
    /scrollContainerRef\?\.current \?\? getClosestScrollContainer\(target\)/,
  );
  assert.match(scrollDirectionVisibilitySource, /overflowY/);
  assert.match(scrollDirectionVisibilitySource, /scroller: scrollContainer === window/);
  assert.match(scrollDirectionVisibilitySource, /yPercent: -100/);
  assert.match(scrollDirectionVisibilitySource, /paused: true/);
  assert.match(scrollDirectionVisibilitySource, /\.progress\(1\)/);
  assert.match(scrollDirectionVisibilitySource, /start: 0/);
  assert.match(scrollDirectionVisibilitySource, /end: "max"/);
  assert.match(scrollDirectionVisibilitySource, /self\.direction === -1/);
  assert.match(scrollDirectionVisibilitySource, /showAnimation\.play\(\)/);
  assert.match(scrollDirectionVisibilitySource, /showAnimation\.reverse\(\)/);
  assert.match(scrollDirectionVisibilitySource, /useReducedMotion/);
  assert.match(scrollDirectionVisibilitySource, /context\.revert\(\)/);
});

test("the public navigation hover uses the Figma underline state", () => {
  assert.match(horizontalTabMenuSource, /border-b-2 border-transparent/);
  assert.match(
    horizontalTabMenuSource,
    /hover:border-\[var\(--color-neutral-100-uniform\)\]/,
  );
  assert.match(
    horizontalTabMenuSource,
    /hover:text-\[var\(--color-neutral-950-uniform\)\]/,
  );
  assert.match(horizontalTabMenuSource, /hover:bg-transparent/);
  assert.match(horizontalTabMenuSource, /aria-current=\{isPublicNavigation/);
  assert.match(
    horizontalTabMenuSource,
    /isActive[\s\S]*border-\[var\(--color-neutral-100-uniform\)\]/,
  );
  assert.doesNotMatch(horizontalTabMenuSource, /focus-visible:border-0/);
  assert.match(
    globalStylesSource,
    /--color-neutral-950-uniform: var\(--app-neutral-950-uniform\)/,
  );
});
