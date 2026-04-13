import {
  createNotificationProps,
  createNotificationShowcaseItem,
} from "./notificationConfig.js";

export const notificationMainComponent = createNotificationProps({});

export const notificationQuickToggleItems = [
  createNotificationShowcaseItem("Base", {
    showCloseButton: false,
    showActions: false,
  }),
  createNotificationShowcaseItem("Close icon", {
    showCloseButton: true,
    showActions: false,
  }),
  createNotificationShowcaseItem("CTA", {
    showCloseButton: true,
    showActions: true,
  }),
];

export const notificationTypeItems = [
  createNotificationShowcaseItem("Avatar", {
    leadingType: "Avatar",
  }),
  createNotificationShowcaseItem("Featured icon", {
    leadingType: "Featured icon",
  }),
];
