import { createBadgeProps, createBadgeShowcaseItem } from "./badgeConfig.js";

export const badgeSizeItems = [
  createBadgeShowcaseItem("S"),
  createBadgeShowcaseItem("M", { size: "M" }),
  createBadgeShowcaseItem("L", { size: "L" }),
];

export const badgeQuickToggleItems = [
  createBadgeShowcaseItem("Text"),
  createBadgeShowcaseItem("Status Dot", { variation: "Dot" }),
  createBadgeShowcaseItem("Flag / Avatar", {
    variation: "Flag / Avatar",
  }),
];

export const badgeStatusItems = [
  createBadgeShowcaseItem("brand 1"),
  createBadgeShowcaseItem("brand 2", { theme: "Brand 2" }),
  createBadgeShowcaseItem("neutral", { theme: "Neutral" }),
  createBadgeShowcaseItem("danger", { theme: "Danger" }),
  createBadgeShowcaseItem("success", { theme: "Success" }),
  createBadgeShowcaseItem("info", { theme: "Info" }),
  createBadgeShowcaseItem("disabled", { theme: "Disabled" }),
];

export const badgeMatrixThemes = [
  "Brand 1",
  "Brand 2",
  "Neutral",
  "Danger",
  "Success",
  "Info",
  "Disabled",
];

export const badgeMatrixVariations = ["Simple", "Dot", "Flag / Avatar"];

export const badgeMatrixSizes = ["S", "M", "L"];

export function createBadgeMatrixProps(theme, variation, size) {
  return createBadgeProps({
    theme,
    variation,
    size,
  });
}
