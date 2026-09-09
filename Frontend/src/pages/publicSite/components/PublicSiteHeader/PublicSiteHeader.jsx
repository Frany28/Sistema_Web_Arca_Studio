import { useRef } from "react";
import clsx from "clsx";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import Button from "../../../../components/ui/Button/Button.jsx";
import HorizontalTabMenu from "../../../../components/ui/HorizontalTabMenu/HorizontalTabMenu.jsx";
import useScrollDirectionVisibility, {
  NAVBAR_SCROLL_DURATION_SECONDS,
} from "../../../../hooks/useScrollDirectionVisibility.js";

const DEFAULT_NAVIGATION_ITEMS = [
  { id: "services", label: "Servicios" },
  { id: "featured-projects", label: "Proyectos destacados" },
  { id: "process", label: "¿Cómo trabajamos?" },
  { id: "about", label: "Sobre nosotros" },
];

function PublicSiteHeader({
  activeNavigationId,
  className,
  navigationItems = DEFAULT_NAVIGATION_ITEMS,
  onNavigate,
  onContact,
  scrollContainerRef,
}) {
  const headerRef = useRef(null);
  const activeNavigationIndex = navigationItems.findIndex(
    (item) => item.id === activeNavigationId,
  );

  useScrollDirectionVisibility(headerRef, { scrollContainerRef });

  return (
    <header
      ref={headerRef}
      className={clsx(
        "main-tool-bar dark flex h-[64px] w-full justify-center bg-black/[0.04] backdrop-blur-[15px] will-change-transform",
        className,
      )}
      data-node-id="4487:112595"
    >
      <nav
        className="h-full w-full max-w-[1200px] px-[16px] pt-[12px] min-[768px]:px-[48px]"
        aria-label="Navegación principal"
        data-node-id="4487:112596"
      >
        <div
          className="relative h-[52px] w-full"
          data-node-id="4487:112597"
        >
          <button
            type="button"
            className="absolute left-0 top-[3.5px] flex h-[32px] w-[152px] cursor-pointer items-center justify-start border-0 bg-transparent p-0"
            aria-label="Ir al inicio"
            onClick={() => onNavigate?.("home")}
            data-node-id="4487:112602"
          >
            <MainLogo
              size="32px"
              appearance="dark"
              alt="ARCA Studio"
              className="h-[32px] w-[152px] justify-start"
            />
          </button>

          <HorizontalTabMenu
            className="absolute left-1/2 top-0 hidden -translate-x-1/2 min-[1024px]:flex"
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

          <div
            className="absolute right-0 top-[3px] flex items-center gap-[8px]"
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
        </div>
      </nav>
    </header>
  );
}

export {
  DEFAULT_NAVIGATION_ITEMS,
  NAVBAR_SCROLL_DURATION_SECONDS as HEADER_SCROLL_DURATION_SECONDS,
};
export default PublicSiteHeader;
