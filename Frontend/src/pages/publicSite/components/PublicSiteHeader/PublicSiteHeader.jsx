import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Add, HambergerMenu } from "iconsax-react";
import useHeaderBackground from "./useHeaderBackground.js";
import PublicSiteMobileMenu from "./PublicSiteMobileMenu.jsx";
import "./PublicSiteHeader.css";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import Button from "../../../../components/ui/Button/Button.jsx";
import HorizontalTabMenu from "../../../../components/ui/HorizontalTabMenu/HorizontalTabMenu.jsx";
import useScrollDirectionVisibility, {
  NAVBAR_SCROLL_DURATION_SECONDS,
} from "../../../../hooks/useScrollDirectionVisibility.js";

const DEFAULT_NAVIGATION_ITEMS = [
  { id: "services", label: "Servicios" },
  { id: "featured-projects", label: "Proyectos destacados" },
  { id: "process", label: "Nuestros Procesos" },
  { id: "about", label: "Sobre nosotros" },
];

const MOBILE_MENU_ID = "public-site-mobile-menu";

function PublicSiteHeader({
  activeNavigationId,
  className,
  navigationItems = DEFAULT_NAVIGATION_ITEMS,
  onNavigate,
  onContact,
  scrollContainerRef,
}) {
  const headerRef = useRef(null);
  const menuToggleRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const backgroundAppearance = useHeaderBackground(headerRef, scrollContainerRef);
  const activeNavigationIndex = navigationItems.findIndex(
    (item) => item.id === activeNavigationId,
  );

  useScrollDirectionVisibility(headerRef, { scrollContainerRef });

  const closeMobileMenu = useCallback((restoreFocus = false) => {
    setIsMobileMenuOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => menuToggleRef.current?.focus());
    }
  }, []);

  const handleMobileNavigate = useCallback(
    (navigationId) => {
      closeMobileMenu();
      onNavigate?.(navigationId);
    },
    [closeMobileMenu, onNavigate],
  );

  const handleMobileContact = useCallback(() => {
    closeMobileMenu();
    onContact?.();
  }, [closeMobileMenu, onContact]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeAtDesktop = (event) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };

    closeAtDesktop(desktopQuery);
    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMobileMenu(true);
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={clsx(
        "main-tool-bar public-site-header dark relative flex h-[67px] w-full justify-center will-change-transform md:h-[64px]",
        isMobileMenuOpen
          ? "bg-transparent backdrop-blur-none md:bg-black/[0.04] md:backdrop-blur-[15px]"
          : "bg-black/[0.04] backdrop-blur-[15px]",
        className,
      )}
      data-node-id="4487:112595"
      data-background={backgroundAppearance}
    >
      {isMobileMenuOpen ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[433px] bg-black/[0.04] backdrop-blur-[15px] md:hidden"
          aria-hidden="true"
        />
      ) : null}

      <nav
        className="relative z-10 h-full w-full max-w-[1200px] px-[16px] pt-[12px] md:px-[48px]"
        aria-label="Navegación principal"
        data-node-id="4487:112596"
      >
        <div
          className="relative h-[52px] w-full"
          data-node-id="4487:112597"
        >
          <button
            type="button"
            className="absolute left-0 top-[6px] flex h-[32px] w-[152px] cursor-pointer items-center justify-start border-0 bg-transparent p-0 md:top-[3.5px]"
            aria-label="Ir al inicio"
            onClick={() => onNavigate?.("home")}
            data-node-id="4487:112602"
          >
            <MainLogo
              size="32px"
              appearance={backgroundAppearance}
              alt="ARCA Studio"
              className="h-[32px] w-[152px] justify-start"
            />
          </button>

          <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 md:block">
            <HorizontalTabMenu
              items={navigationItems.map((item) => item.label)}
              activeIndex={activeNavigationIndex}
              interactive
              presentation="publicNavigation"
              style="Underlined"
              filled="off"
              onChange={(index) => onNavigate?.(navigationItems[index].id)}
              aria-label="Secciones de inicio"
              data-node-id="4487:112598"
            />
          </div>

          <div
            className="absolute right-0 top-[3px] hidden items-center gap-[8px] md:flex"
            data-node-id="4487:112599"
          >
            <Button
              theme="Primary"
              type="Solid"
              size="S"
              fitContent
              showLeftIcon={false}
              showRightIcon={false}
              className="[&]:h-auto [&]:border-0"
              onClick={onContact}
              aria-disabled={!onContact || undefined}
              data-node-id="4781:135050"
            >
              Contáctanos
            </Button>
          </div>

          <button
            ref={menuToggleRef}
            type="button"
            className="public-site-menu-toggle absolute -top-[4px] right-0 flex size-[52px] items-center justify-center rounded-[var(--radius-3)] border-0 bg-transparent p-[16px] text-[var(--public-navigation-color)] outline-none transition-colors duration-150 hover:text-[var(--public-navigation-hover-color)] focus-visible:ring-2 focus-visible:ring-current motion-reduce:transition-none md:hidden"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            data-node-id={isMobileMenuOpen ? "5156:130000" : "5074:27974"}
          >
            {isMobileMenuOpen ? (
              <Add
                className="size-[20px] rotate-45"
                color="currentColor"
                size={20}
                variant="Linear"
                aria-hidden="true"
              />
            ) : (
              <HambergerMenu
                className="size-[20px]"
                color="currentColor"
                size={20}
                variant="Linear"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <PublicSiteMobileMenu
          id={MOBILE_MENU_ID}
          isOpen={isMobileMenuOpen}
          activeNavigationId={activeNavigationId}
          navigationItems={navigationItems}
          contactDisabled={!onContact}
          onNavigate={handleMobileNavigate}
          onContact={handleMobileContact}
        />
      </nav>
    </header>
  );
}

export {
  DEFAULT_NAVIGATION_ITEMS,
  NAVBAR_SCROLL_DURATION_SECONDS as HEADER_SCROLL_DURATION_SECONDS,
};
export default PublicSiteHeader;
