import {
  createHorizontalTabMenuProps,
  createHorizontalTabMenuShowcaseItem,
} from "./horizontalTabMenuConfig.js";

export const horizontalTabMenuMainComponent = createHorizontalTabMenuProps();

export const horizontalTabMenuStateItems = [
  createHorizontalTabMenuShowcaseItem("Active", {
    items: ["Menu item1"],
    activeIndex: 0,
  }),
  createHorizontalTabMenuShowcaseItem("Inactive", {
    items: ["Menu item2"],
    activeIndex: -1,
  }),
];

export const horizontalTabMenuPreviewItems = [
  createHorizontalTabMenuShowcaseItem("3 items", {
    items: ["Menu item1", "Menu item2", "Menu item3"],
    activeIndex: 0,
  }),
  createHorizontalTabMenuShowcaseItem("6 items", {
    activeIndex: 0,
  }),
];

export const horizontalTabMenuExampleItems = createHorizontalTabMenuProps({
  interactive: true,
});
