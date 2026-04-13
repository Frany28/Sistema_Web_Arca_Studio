import {
  createSideNavigationProps,
  createSideNavigationShowcaseItem,
} from "./sideNavigationConfig.js";

export const sideNavigationMainComponent = createSideNavigationProps({
  defaultExpanded: true,
});

export const sideNavigationCollapsedComponent = createSideNavigationProps({
  expanded: false,
  defaultExpanded: false,
});

export const sideNavigationQuickToggleItems = [
  createSideNavigationShowcaseItem("Base", {}),
  createSideNavigationShowcaseItem("Colapsado", {
    expanded: false,
    defaultExpanded: false,
  }),
  createSideNavigationShowcaseItem("Proyecto activo", {
    defaultActiveItemId: "project-1",
  }),
];
