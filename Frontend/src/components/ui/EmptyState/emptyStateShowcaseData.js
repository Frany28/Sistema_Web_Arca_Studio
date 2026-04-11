import {
  createEmptyStateProps,
  createEmptyStateShowcaseItem,
} from "./emptyStateConfig.js";

export const emptyStateMainComponent = createEmptyStateProps({
  size: "S",
  title: "Título principal",
});

export const emptyStateQuickToggleItems = [
  createEmptyStateShowcaseItem("Base", {
    showFeaturedIcon: false,
    showActions: false,
  }),
  createEmptyStateShowcaseItem("Featured Icon", {
    showFeaturedIcon: true,
    showActions: false,
  }),
  createEmptyStateShowcaseItem("CTAs", {
    showFeaturedIcon: false,
    showActions: true,
  }),
];

export const emptyStateSizeItems = [
  createEmptyStateShowcaseItem("S", {
    size: "S",
  }),
  createEmptyStateShowcaseItem("M", {
    size: "M",
    title: "Título principal",
  }),
];
