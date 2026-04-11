import {
  createProgressStepBaseProps,
  createProgressStepBaseShowcaseItem,
} from "./progressStepBaseConfig.js";

export const progressStepBaseMainComponent = createProgressStepBaseProps();

export const progressStepBaseQuickToggleItems = [
  createProgressStepBaseShowcaseItem("Base", {
    type: "Featured Icon",
    state: "Completed",
    showSubtext: false,
  }),
  createProgressStepBaseShowcaseItem("Subtext", {
    type: "Featured Icon",
    state: "Completed",
  }),
];

export const progressStepBaseTypeItems = [
  createProgressStepBaseShowcaseItem("Line text", {
    type: "Line text",
    state: "Completed",
    showSubtext: false,
  }),
  createProgressStepBaseShowcaseItem("Numbered", {
    type: "Numbered",
    state: "Completed",
    showSubtext: false,
  }),
  createProgressStepBaseShowcaseItem("Featured icon", {
    type: "Featured Icon",
    state: "Completed",
    showSubtext: false,
  }),
];

export const progressStepBaseLineTextStateItems = [
  createProgressStepBaseShowcaseItem("Incomplete", {
    type: "Line text",
    state: "Incomplete",
  }),
  createProgressStepBaseShowcaseItem("Active", {
    type: "Line text",
    state: "Active",
  }),
  createProgressStepBaseShowcaseItem("Completed", {
    type: "Line text",
    state: "Completed",
  }),
];

export const progressStepBaseNumberedStateItems = [
  createProgressStepBaseShowcaseItem("Incomplete", {
    type: "Numbered",
    state: "Incomplete",
  }),
  createProgressStepBaseShowcaseItem("Active", {
    type: "Numbered",
    state: "Active",
  }),
  createProgressStepBaseShowcaseItem("Completed", {
    type: "Numbered",
    state: "Completed",
  }),
];

export const progressStepBaseFeaturedIconStateItems = [
  createProgressStepBaseShowcaseItem("Incomplete", {
    type: "Featured Icon",
    state: "Incomplete",
  }),
  createProgressStepBaseShowcaseItem("Active", {
    type: "Featured Icon",
    state: "Active",
  }),
  createProgressStepBaseShowcaseItem("Completed", {
    type: "Featured Icon",
    state: "Completed",
  }),
];

export const progressStepBaseSizeItems = [
  createProgressStepBaseShowcaseItem("S", {
    type: "Numbered",
    state: "Incomplete",
    size: "S",
  }),
  createProgressStepBaseShowcaseItem("M", {
    type: "Numbered",
    state: "Incomplete",
    size: "M",
  }),
  createProgressStepBaseShowcaseItem("L", {
    type: "Numbered",
    state: "Incomplete",
    size: "L",
  }),
];
