import {
  createSideNavigationProps,
  createSideNavigationShowcaseItem,
} from "./sideNavigationConfig.js";

export const sideNavigationMainComponent = createSideNavigationProps({
  activeItemId: "dashboard",
  defaultActiveItemId: "dashboard",
});

export const sideNavigationQuickToggleItems = [
  createSideNavigationShowcaseItem("Base", {}),
  createSideNavigationShowcaseItem("Colapsado", {
    collapsed: true,
    defaultCollapsed: true,
  }),
  createSideNavigationShowcaseItem("Proyecto activo", {
    activeItemId: "project-1",
    defaultActiveItemId: "project-1",
  }),
];
