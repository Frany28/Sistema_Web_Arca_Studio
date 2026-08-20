export const SIDE_NAVIGATION_DEFAULT_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
    wrapperHeight: "44px",
  },
  {
    id: "requests",
    label: "Solicitudes",
    icon: "requests",
    wrapperHeight: "44px",
  },
  {
    id: "more-projects",
    label: "Ver más proyectos",
    icon: "discover",
    wrapperHeight: "56px",
  },
  {
    id: "settings",
    label: "Configuraciones",
    icon: "settings",
    wrapperHeight: "56px",
  },
];

export const SIDE_NAVIGATION_DEFAULT_PROPS = {
  items: SIDE_NAVIGATION_DEFAULT_ITEMS,
  activeItemId: undefined,
  defaultActiveItemId: null,
  defaultExpanded: true,
  searchPlaceholder: "Buscar...",
  newOpportunityLabel: "Nueva oportunidad",
  userName: "Alan Wake",
  userEmail: "alanexample.com",
  "aria-label": "Navegación lateral",
};

export function createSideNavigationProps(overrides = {}) {
  return {
    ...SIDE_NAVIGATION_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createSideNavigationShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createSideNavigationProps(overrides),
  };
}
