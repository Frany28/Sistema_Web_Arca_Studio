export const SIDE_NAVIGATION_DEFAULT_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
    wrapperHeight: "44px",
  },
  {
    id: "project-1",
    label: "Proyecto 1",
    icon: "project",
    trailingIcon: "chevron",
    wrapperHeight: "56px",
  },
  {
    id: "project-2",
    label: "Proyecto 2",
    icon: "project",
    trailingIcon: "window",
    wrapperHeight: "44px",
  },
  {
    id: "more-projects",
    label: "Ver más proyectos",
    icon: "discover",
    trailingIcon: "chevron",
    wrapperHeight: "56px",
  },
  {
    id: "settings",
    label: "Configuraciones",
    icon: "settings",
    trailingIcon: "chevron",
    wrapperHeight: "56px",
  },
];

export const SIDE_NAVIGATION_DEFAULT_PROPS = {
  items: SIDE_NAVIGATION_DEFAULT_ITEMS,
  activeItemId: "dashboard",
  defaultActiveItemId: "dashboard",
  searchPlaceholder: "Buscar...",
  userName: "Alan Wake",
  userEmail: "alanexample.com",
  "aria-label": "Side navigation",
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
