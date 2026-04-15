import {
  createCommentPanelProps,
  createCommentPanelShowcaseItem,
} from "./commentPanelConfig.js";

export const commentPanelMainComponent = createCommentPanelProps();

export const commentPanelQuickToggleItems = [
  createCommentPanelShowcaseItem("Base", {}),
];

export const commentPanelStateItems = [
  createCommentPanelShowcaseItem("Default", {
    items: [
      {
        id: 1,
        name: "Jonh Doe",
        action: "Comentó",
        badgeLabel: "Stand Nexar 2026.",
        description: "Podemos ajustar la iluminación en este render?",
        timestamp: "Hace 2 minutos",
        showBadge: true,
        state: "Default",
      },
    ],
  }),
  createCommentPanelShowcaseItem("Hover", {
    items: [
      {
        id: 1,
        name: "Jonh Doe",
        action: "Comentó",
        badgeLabel: "Stand Nexar 2026.",
        description: "Podemos ajustar la iluminación en este render?",
        timestamp: "Hace 2 minutos",
        showBadge: true,
        state: "Hover",
      },
    ],
  }),
  createCommentPanelShowcaseItem("Read", {
    items: [
      {
        id: 1,
        name: "Jonh Doe",
        action: "Comentó",
        badgeLabel: "Stand Nexar 2026.",
        description: "Podemos ajustar la iluminación en este render?",
        timestamp: "Hace 2 minutos",
        showBadge: true,
        state: "Read",
      },
    ],
  }),
];
