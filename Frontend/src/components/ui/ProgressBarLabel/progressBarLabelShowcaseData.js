import {
  createProgressBarLabelProps,
  createProgressBarLabelShowcaseItem,
} from "./progressBarLabelConfig.js";

export const progressBarLabelMainComponent = createProgressBarLabelProps();

export const progressBarLabelQuickToggleItems = [
  createProgressBarLabelShowcaseItem("Base", {
    position: "side",
    showTitle: false,
    showSublabel: false,
  }),
  createProgressBarLabelShowcaseItem("Title", {
    position: "side",
    showSublabel: false,
  }),
  createProgressBarLabelShowcaseItem("Sub label", {
    position: "side",
    showTitle: false,
  }),
];

export const progressBarLabelPercentagePositionItems = [
  createProgressBarLabelShowcaseItem("On top"),
  createProgressBarLabelShowcaseItem("On side", {
    position: "side",
  }),
];

export const progressBarLabelExampleItem = createProgressBarLabelProps();
