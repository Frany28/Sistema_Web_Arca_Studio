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

test("the public home header preserves the Figma structure and labels", () => {
  assert.match(headerSource, /data-node-id="4487:112595"/);
  assert.match(headerSource, /h-\[64px\]/);
  assert.match(headerSource, /max-w-\[1200px\]/);
  assert.match(headerSource, /Servicios/);
  assert.match(headerSource, /Proyectos destacados/);
  assert.match(headerSource, /¿Cómo trabajamos\?/);
  assert.match(headerSource, /Sobre nosotros/);
  assert.match(headerSource, /Registrarse/);
  assert.match(headerSource, /Iniciar sesión/);
});

test("the public home header is permanently dark and reuses shared UI", () => {
  assert.match(headerSource, /appearance="dark"/);
  assert.match(headerSource, /color-neutral-100-uniform/);
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
  assert.match(headerSource, /gsap\.registerPlugin\(ScrollTrigger\)/);
  assert.match(headerSource, /HEADER_SCROLL_DURATION_SECONDS = 0\.2/);
  assert.match(headerSource, /\.from\(header, \{/);
  assert.match(headerSource, /yPercent: -100/);
  assert.match(headerSource, /paused: true/);
  assert.match(headerSource, /\.progress\(1\)/);
  assert.match(headerSource, /ScrollTrigger\.create\(\{/);
  assert.match(headerSource, /start: "top top"/);
  assert.match(headerSource, /end: "max"/);
  assert.match(headerSource, /self\.direction === -1/);
  assert.match(headerSource, /showAnimation\.play\(\)/);
  assert.match(headerSource, /showAnimation\.reverse\(\)/);
  assert.match(headerSource, /useReducedMotion/);
  assert.match(headerSource, /context\.revert\(\)/);
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
