import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

const headerSource = readSource(
  "../src/pages/publicSite/components/PublicSiteHeader/PublicSiteHeader.jsx",
);
const mobileMenuSource = readSource(
  "../src/pages/publicSite/components/PublicSiteHeader/PublicSiteMobileMenu.jsx",
);

test("the public header keeps its navigation and shared desktop UI", () => {
  for (const label of [
    "Servicios",
    "Proyectos destacados",
    "Nuestros Procesos",
    "Sobre nosotros",
  ]) {
    assert.match(headerSource, new RegExp(label));
  }

  assert.match(headerSource, /useHeaderBackground\(headerRef, scrollContainerRef\)/);
  assert.match(headerSource, /useScrollDirectionVisibility\(headerRef/);
  assert.match(headerSource, /<MainLogo/);
  assert.match(headerSource, /<HorizontalTabMenu/);
  assert.match(headerSource, /<Button/);
});

test("desktop and collapsed navigation are mutually exclusive at 1024px", () => {
  assert.match(headerSource, /hidden -translate-x-1\/2 lg:block/);
  assert.match(headerSource, /hidden items-center gap-\[8px\] lg:flex/);
  assert.match(headerSource, /public-site-menu-toggle[\s\S]*?lg:hidden/);
  assert.match(mobileMenuSource, /top-\[67px\][^\n]*lg:hidden/);
  assert.match(headerSource, /matchMedia\("\(min-width: 1024px\)"\)/);
  assert.match(headerSource, /if \(event\.matches\) setIsMobileMenuOpen\(false\)/);
});

test("the collapsed menu is accessible and uses navigationItems", () => {
  assert.match(headerSource, /HambergerMenu/);
  assert.match(headerSource, /"Cerrar menú" : "Abrir menú"/);
  assert.match(headerSource, /aria-expanded=\{isMobileMenuOpen\}/);
  assert.match(headerSource, /aria-controls=\{MOBILE_MENU_ID\}/);
  assert.match(mobileMenuSource, /navigationItems\.map\(\(item\) =>/);
  assert.match(mobileMenuSource, /onNavigate\(item\.id\)/);
  assert.match(mobileMenuSource, /onClick=\{onContact\}/);
  assert.doesNotMatch(
    mobileMenuSource,
    /Servicios|Proyectos destacados|Nuestros Procesos|Sobre nosotros/,
  );
});

test("mobile actions close the menu and Escape restores toggle focus", () => {
  assert.match(
    headerSource,
    /handleMobileNavigate[\s\S]*?closeMobileMenu\(\)[\s\S]*?onNavigate/,
  );
  assert.match(
    headerSource,
    /handleMobileContact[\s\S]*?closeMobileMenu\(\)[\s\S]*?onContact/,
  );
  assert.match(headerSource, /event\.key !== "Escape"/);
  assert.match(headerSource, /closeMobileMenu\(true\)/);
  assert.match(headerSource, /menuToggleRef\.current\?\.focus\(\)/);
});

test("the vertical menu animation respects reduced motion", () => {
  assert.match(mobileMenuSource, /AnimatePresence/);
  assert.match(mobileMenuSource, /useReducedMotion\(\)/);
  assert.match(mobileMenuSource, /staggerChildren/);
  assert.match(mobileMenuSource, /y: reduceMotion \? 0 : -6/);
  assert.doesNotMatch(mobileMenuSource, /scale|spring|bounce|x:/);
});
