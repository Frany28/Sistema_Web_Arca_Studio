import {
  createListItemProps,
  createListItemShowcaseItem,
} from "./listItemConfig.js";

export const listItemMainComponent = createListItemProps({});

export const listItemQuickToggleItems = [
  createListItemShowcaseItem("Default", {
    type: "Default",
    state: "Default",
  }),
  createListItemShowcaseItem("Hover", {
    type: "Default",
    state: "Hover",
  }),
  createListItemShowcaseItem("Upload file", {
    type: "Upload file",
    timestamp: "Hace 30 minutos",
  }),
  createListItemShowcaseItem("CTA buttons", {
    type: "Default",
    showButtons: true,
  }),
];

export const listItemInteractiveExample = createListItemProps({
  interactive: true,
  showButtons: true,
  comment: "Podemos ajustar la iluminación en este render?",
});
