import {
  createListItemProps,
  createListItemShowcaseItem,
} from "./listItemConfig.js";

export const listItemMainComponent = createListItemProps();

export const listItemInteractiveExample = createListItemProps({
  showActions: true,
  primaryActionLabel: "Ver más",
  secondaryActionLabel: "Ignorar",
});

export const listItemQuickToggleItems = [
  createListItemShowcaseItem("Default", {}),
  createListItemShowcaseItem("CTA", {
    showActions: true,
    primaryActionLabel: "Ver más",
    secondaryActionLabel: "Ignorar",
  }),
];

export const listItemStateItems = [
  createListItemShowcaseItem("Default", {
    state: "Default",
  }),
  createListItemShowcaseItem("Hover", {
    state: "Hover",
  }),
  createListItemShowcaseItem("Read", {
    state: "Read",
  }),
];
