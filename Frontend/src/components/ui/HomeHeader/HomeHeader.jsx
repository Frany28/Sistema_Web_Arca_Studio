import clsx from "clsx";

import MainLogo from "../../../assets/logos/MainLogo.jsx";
import Button from "../Button/Button.jsx";

const DEFAULT_NAVIGATION_ITEMS = [
  { id: "services", label: "Servicios" },
  { id: "featured-projects", label: "Proyectos destacados" },
  { id: "process", label: "¿Cómo trabajamos?" },
  { id: "about", label: "Sobre nosotros" },
];

function HomeHeader({
  className,
  navigationItems = DEFAULT_NAVIGATION_ITEMS,
  onNavigate,
  onRegister,
  onLogin,
}) {
  return (
    <header
      className={clsx(
        "dark flex h-[64px] w-full justify-center bg-black/[0.04] backdrop-blur-[15px]",
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
          <MainLogo
            size="32px"
            appearance="dark"
            alt="ARCA Studio"
            className="absolute left-0 top-[3.5px] h-[32px] w-[152px] justify-start"
            data-node-id="4487:112602"
          />

          <ul
            className="absolute left-1/2 top-0 hidden h-[52px] -translate-x-1/2 items-start gap-[8px] min-[1024px]:flex"
            aria-label="Secciones de inicio"
            data-node-id="4487:112598"
          >
            {navigationItems.map((item) => (
              <li key={item.id} className="flex h-[52px] items-start py-[8px]">
                <button
                  type="button"
                  className="text-heading-8 flex h-[36px] items-center justify-center whitespace-nowrap rounded-[var(--radius-1)] px-[4px] pb-[8px] text-center text-[var(--color-neutral-100-uniform)] outline-none transition-colors duration-150 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none"
                  onClick={() => onNavigate?.(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div
            className="absolute right-0 top-[3px] flex items-center gap-[8px]"
            data-node-id="4487:112599"
          >
            <Button
              theme="Primary"
              type="Outline"
              size="S"
              fitContent
              showLeftIcon={false}
              showRightIcon={false}
              className="!border-[var(--color-neutral-100-uniform)] !bg-transparent !text-[var(--color-neutral-100-uniform)] hover:!border-[var(--color-neutral-100-uniform)] hover:!bg-white/10 hover:!text-[var(--color-neutral-100-uniform)] focus-visible:!border-[var(--color-neutral-100-uniform)] focus-visible:!text-[var(--color-neutral-100-uniform)]"
              onClick={onRegister}
              data-node-id="4487:112600"
            >
              Registrarse
            </Button>

            <Button
              theme="Primary"
              type="Solid"
              size="S"
              fitContent
              showLeftIcon={false}
              showRightIcon={false}
              className="!border-[var(--color-primary-300)] !bg-[var(--color-primary-300)] !text-[var(--color-neutral-100-uniform)] hover:!border-[var(--color-primary-200)] hover:!bg-[var(--color-primary-200)] hover:!text-[var(--color-neutral-100-uniform)]"
              onClick={onLogin}
              data-node-id="4487:112601"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export { DEFAULT_NAVIGATION_ITEMS };
export default HomeHeader;
