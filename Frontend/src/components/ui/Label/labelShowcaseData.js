import { createLabelProps, createLabelShowcaseItem } from "./labelConfig.js";

export const labelMainComponent = createLabelProps();

export const labelStateItems = [
  createLabelShowcaseItem("Default", {
    state: "Default",
  }),
  createLabelShowcaseItem("Disabled", {
    state: "Disabled",
  }),
];

export const labelQuickToggleItems = [
  createLabelShowcaseItem("Text", {
    required: false,
    information: false,
  }),
  createLabelShowcaseItem("Required", {
    information: false,
  }),
  createLabelShowcaseItem("Information", {
    required: false,
  }),
  createLabelShowcaseItem("Both", {}),
];
