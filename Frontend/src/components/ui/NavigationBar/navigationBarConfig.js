export const NAVIGATION_BAR_DEFAULT_ITEMS = [
  "Proyectos Destacados",
  "Sobre Nosotros",
  "Nuestros Procesos",
  "Contacto",
];

export const NAVIGATION_BAR_DEFAULT_PROPS = {
  navItems: NAVIGATION_BAR_DEFAULT_ITEMS,
  activeIndex: -1,
  defaultActiveIndex: -1,
  showContactButton: true,
  showLoginButton: true,
  contactLabel: "Contáctanos",
  loginLabel: "Iniciar sesión",
  mobileMenuLabel: "Abrir menú",
  utilityText: "Lunes, 23 de Marzo",
  variant: "desktop",
  "aria-label": "Navigation bar",
};

export function createNavigationBarProps(overrides = {}) {
  return {
    ...NAVIGATION_BAR_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createNavigationBarShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createNavigationBarProps(overrides),
  };
}
