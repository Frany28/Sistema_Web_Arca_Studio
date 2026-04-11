import {
  createFooterSectionProps,
  createFooterSectionShowcaseItem,
} from "./footerSectionConfig.js";

export const footerSectionMainComponent = createFooterSectionProps({
  activeNavIndex: -1,
  defaultActiveNavIndex: -1,
  variant: "desktop",
});

export const footerSectionMobileComponent = createFooterSectionProps({
  activeNavIndex: -1,
  defaultActiveNavIndex: -1,
  variant: "mobile",
});

export const footerSectionQuickToggleItems = [
  createFooterSectionShowcaseItem("Desktop", {
    activeNavIndex: -1,
    defaultActiveNavIndex: -1,
    variant: "desktop",
  }),
  createFooterSectionShowcaseItem("Mobile", {
    activeNavIndex: -1,
    defaultActiveNavIndex: -1,
    variant: "mobile",
  }),
];
