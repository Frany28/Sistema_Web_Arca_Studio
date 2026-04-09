import {
  createHorizontalTabMenuProps,
  createHorizontalTabMenuShowcaseItem,
} from "./horizontalTabMenuConfig.js";

export const horizontalTabMenuMainComponent = createHorizontalTabMenuProps();

export const horizontalTabMenuFilledOnItems = [
  "Menu item1",
  "Menu item2",
  "Menu item3",
  "Menu item4",
  "Menu item5",
];

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

export const horizontalTabMenuFilledOnMainComponent =
  createHorizontalTabMenuProps({
    filled: "on",
    items: horizontalTabMenuFilledOnItems,
    activeIndex: 0,
  });

export const horizontalTabMenuFilledOnStateItems = [
  createHorizontalTabMenuShowcaseItem("Active", {
    filled: "on",
    items: ["Menu item1"],
    activeIndex: 0,
  }),
  createHorizontalTabMenuShowcaseItem("Inactive", {
    filled: "on",
    items: ["Menu item2"],
    activeIndex: -1,
  }),
];

export const horizontalTabMenuFilledOnPreviewItems = [
  createHorizontalTabMenuShowcaseItem("3 items", {
    filled: "on",
    items: ["Menu item1", "Menu item2", "Menu item3"],
    activeIndex: 0,
  }),
  createHorizontalTabMenuShowcaseItem("5 items", {
    filled: "on",
    items: horizontalTabMenuFilledOnItems,
    activeIndex: 0,
  }),
];

export const horizontalTabMenuFilledOnExampleItems =
  createHorizontalTabMenuProps({
    filled: "on",
    items: horizontalTabMenuFilledOnItems,
    activeIndex: 0,
    interactive: true,
  });

export const horizontalTabMenuUnderlinedMainComponent =
  createHorizontalTabMenuProps({
    style: "Underlined",
    activeIndex: 0,
  });

export const horizontalTabMenuUnderlinedStateItems = [
  createHorizontalTabMenuShowcaseItem("Active", {
    style: "Underlined",
    items: ["Menu item1"],
    activeIndex: 0,
  }),
  createHorizontalTabMenuShowcaseItem("Inactive", {
    style: "Underlined",
    items: ["Menu item2"],
    activeIndex: -1,
  }),
];

export const horizontalTabMenuUnderlinedPreviewItems = [
  createHorizontalTabMenuShowcaseItem("3 items", {
    style: "Underlined",
    items: ["Menu item1", "Menu item2", "Menu item3"],
    activeIndex: 0,
  }),
  createHorizontalTabMenuShowcaseItem("6 items", {
    style: "Underlined",
    activeIndex: 0,
  }),
];

export const horizontalTabMenuUnderlinedExampleItems =
  createHorizontalTabMenuProps({
    style: "Underlined",
    activeIndex: 0,
    interactive: true,
  });
