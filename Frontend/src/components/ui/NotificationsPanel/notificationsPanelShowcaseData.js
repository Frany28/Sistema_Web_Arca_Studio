import {
  createNotificationsPanelProps,
  createNotificationsPanelShowcaseItem,
} from "./notificationsPanelConfig.js";

export const notificationsPanelMainComponent = createNotificationsPanelProps();

export const notificationsPanelQuickToggleItems = [
  createNotificationsPanelShowcaseItem("Base", {}),
];

export const notificationsPanelStateItems = [
  createNotificationsPanelShowcaseItem("Default", {
    items: [
      {
        id: 1,
        name: "Jonh Doe",
        actionText: "modificó el estado de",
        targetLabel: "Stand Nexar 2026.",
        description: "",
        timestamp: "Hace 2 minutos",
        showActions: false,
        showFile: false,
        state: "Default",
      },
    ],
  }),
  createNotificationsPanelShowcaseItem("Hover", {
    items: [
      {
        id: 1,
        name: "Jonh Doe",
        actionText: "modificó el estado de",
        targetLabel: "Stand Nexar 2026.",
        description: "",
        timestamp: "Hace 2 minutos",
        showActions: false,
        showFile: false,
        state: "Hover",
      },
    ],
  }),
  createNotificationsPanelShowcaseItem("Read", {
    items: [
      {
        id: 1,
        name: "Jonh Doe",
        actionText: "modificó el estado de",
        targetLabel: "Stand Nexar 2026.",
        description: "",
        timestamp: "Hace 2 minutos",
        showActions: false,
        showFile: false,
        state: "Read",
      },
    ],
  }),
];
