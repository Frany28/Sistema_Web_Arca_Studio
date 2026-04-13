import {
  createDropdownMenuProps,
  createDropdownMenuShowcaseItem,
} from "./dropdownMenuConfig.js";

export const dropdownMenuMainComponent = createDropdownMenuProps({
  type: "Text",
  showDivider: true,
  showContainer: false,
});

export const dropdownMenuStateItems = [
  createDropdownMenuShowcaseItem("Text / Default", {
    type: "Text",
    state: "Default",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Text / Hover", {
    type: "Text",
    state: "Hover",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Text / Selected", {
    type: "Text",
    state: "Selected",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Icon / Default", {
    type: "Icon",
    state: "Default",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Icon / Hover", {
    type: "Icon",
    state: "Hover",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Icon / Selected", {
    type: "Icon",
    state: "Selected",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Checkbox / Default", {
    type: "Checkbox",
    state: "Default",
    checked: "No",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Checkbox / Hover", {
    type: "Checkbox",
    state: "Hover",
    checked: "No",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Checkbox / Selected", {
    type: "Checkbox",
    state: "Selected",
    checked: "No",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("User profile / Default", {
    type: "User profile",
    state: "Default",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("User profile / Hover", {
    type: "User profile",
    state: "Hover",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("User profile / Selected", {
    type: "User profile",
    state: "Selected",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Flag / Default", {
    type: "Flag",
    state: "Default",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Flag / Hover", {
    type: "Flag",
    state: "Hover",
    showContainer: false,
  }),
  createDropdownMenuShowcaseItem("Flag / Selected", {
    type: "Flag",
    state: "Selected",
    showContainer: false,
  }),
];

export const dropdownMenuOpenItems = [
  createDropdownMenuShowcaseItem("Text / Open", {
    type: "Text",
    label: "Label",
    supportingText: "@username",
    open: true,
    defaultOpen: true,
    showContainer: true,
    items: [
      {
        id: "username",
        label: "Label",
        supportingText: "@username",
        type: "Text",
      },
      {
        id: "billing",
        label: "Billing",
        supportingText: "@billing",
        type: "Text",
      },
      {
        id: "support",
        label: "Support",
        supportingText: "@support",
        type: "Text",
      },
    ],
  }),
  createDropdownMenuShowcaseItem("Icon / Open", {
    type: "Icon",
    label: "Label",
    supportingText: "@username",
    open: true,
    defaultOpen: true,
    showContainer: true,
    items: [
      { id: "dashboard", label: "Dashboard", supportingText: "@dashboard", type: "Icon" },
      { id: "analytics", label: "Analytics", supportingText: "@analytics", type: "Icon" },
      { id: "reports", label: "Reports", supportingText: "@reports", type: "Icon" },
      { id: "settings", label: "Settings", supportingText: "@settings", type: "Icon" },
    ],
  }),
  createDropdownMenuShowcaseItem("Checkbox / Open", {
    type: "Checkbox",
    label: "Label",
    supportingText: "@username",
    checked: "No",
    open: true,
    defaultOpen: true,
    showContainer: true,
    hoveredItemId: "checked",
    items: [
      {
        id: "checked",
        label: "Label",
        supportingText: "@username",
        type: "Checkbox",
        checked: "Yes",
      },
      {
        id: "unchecked-1",
        label: "Label",
        supportingText: "@username",
        type: "Checkbox",
        checked: "No",
      },
      {
        id: "unchecked-2",
        label: "Label",
        supportingText: "@username",
        type: "Checkbox",
        checked: "No",
      },
      {
        id: "unchecked-3",
        label: "Label",
        supportingText: "@username",
        type: "Checkbox",
        checked: "No",
      },
    ],
  }),
  createDropdownMenuShowcaseItem("User profile / Open", {
    type: "User profile",
    label: "Label",
    supportingText: "@username",
    open: true,
    defaultOpen: true,
    showContainer: true,
    items: [
      {
        id: "alan",
        label: "Alan Wake",
        supportingText: "@alanwake",
        type: "User profile",
        avatarSrc:
          "https://www.figma.com/api/mcp/asset/51a3a0d7-a97f-48eb-a263-877571497be3",
      },
      {
        id: "saga",
        label: "Saga Anderson",
        supportingText: "@saga",
        type: "User profile",
        avatarSrc:
          "https://www.figma.com/api/mcp/asset/51a3a0d7-a97f-48eb-a263-877571497be3",
      },
      {
        id: "casey",
        label: "Alex Casey",
        supportingText: "@casey",
        type: "User profile",
        avatarSrc:
          "https://www.figma.com/api/mcp/asset/51a3a0d7-a97f-48eb-a263-877571497be3",
      },
    ],
  }),
  createDropdownMenuShowcaseItem("Flag / Open", {
    type: "Flag",
    label: "Label",
    supportingText: "@username",
    open: true,
    defaultOpen: true,
    showContainer: true,
    items: [
      { id: "us", label: "United States", supportingText: "@us", type: "Flag", countryCode: "US" },
      { id: "ve", label: "Venezuela", supportingText: "@ve", type: "Flag", countryCode: "VE" },
      { id: "es", label: "Espana", supportingText: "@es", type: "Flag", countryCode: "ES" },
      { id: "ar", label: "Argentina", supportingText: "@ar", type: "Flag", countryCode: "AR" },
    ],
  }),
];

export const dropdownMenuQuickToggleItems = [
  createDropdownMenuShowcaseItem("Text", {
    type: "Text",
    label: "Label",
    supportingText: "@username",
    showContainer: false,
    items: [
      {
        id: "username",
        label: "Label",
        supportingText: "@username",
        type: "Text",
      },
      {
        id: "billing",
        label: "Billing",
        supportingText: "@billing",
        type: "Text",
      },
      {
        id: "support",
        label: "Support",
        supportingText: "@support",
        type: "Text",
      },
    ],
  }),
  createDropdownMenuShowcaseItem("Icon", {
    type: "Icon",
    label: "Label",
    supportingText: "@username",
    showContainer: false,
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        supportingText: "@dashboard",
        type: "Icon",
      },
      {
        id: "analytics",
        label: "Analytics",
        supportingText: "@analytics",
        type: "Icon",
      },
      {
        id: "reports",
        label: "Reports",
        supportingText: "@reports",
        type: "Icon",
      },
      {
        id: "settings",
        label: "Settings",
        supportingText: "@settings",
        type: "Icon",
      },
    ],
  }),
  createDropdownMenuShowcaseItem("Checkbox", {
    type: "Checkbox",
    label: "Label",
    supportingText: "@username",
    checked: "No",
    showContainer: false,
    items: [
      {
        id: "checked",
        label: "Label",
        supportingText: "@username",
        type: "Checkbox",
        checked: "Yes",
      },
      {
        id: "unchecked-1",
        label: "Label",
        supportingText: "@username",
        type: "Checkbox",
        checked: "No",
      },
      {
        id: "unchecked-2",
        label: "Label",
        supportingText: "@username",
        type: "Checkbox",
        checked: "No",
      },
      {
        id: "unchecked-3",
        label: "Label",
        supportingText: "@username",
        type: "Checkbox",
        checked: "No",
      },
    ],
  }),
  createDropdownMenuShowcaseItem("User profile", {
    type: "User profile",
    label: "Label",
    supportingText: "@username",
    showContainer: false,
    items: [
      {
        id: "alan",
        label: "Alan Wake",
        supportingText: "@alanwake",
        type: "User profile",
        avatarSrc:
          "https://www.figma.com/api/mcp/asset/51a3a0d7-a97f-48eb-a263-877571497be3",
      },
      {
        id: "saga",
        label: "Saga Anderson",
        supportingText: "@saga",
        type: "User profile",
        avatarSrc:
          "https://www.figma.com/api/mcp/asset/51a3a0d7-a97f-48eb-a263-877571497be3",
      },
      {
        id: "casey",
        label: "Alex Casey",
        supportingText: "@casey",
        type: "User profile",
        avatarSrc:
          "https://www.figma.com/api/mcp/asset/51a3a0d7-a97f-48eb-a263-877571497be3",
      },
    ],
  }),
  createDropdownMenuShowcaseItem("Flag", {
    type: "Flag",
    label: "Label",
    supportingText: "@username",
    showContainer: false,
    items: [
      {
        id: "us",
        label: "United States",
        supportingText: "@us",
        type: "Flag",
        countryCode: "US",
      },
      {
        id: "ve",
        label: "Venezuela",
        supportingText: "@ve",
        type: "Flag",
        countryCode: "VE",
      },
      {
        id: "es",
        label: "Espana",
        supportingText: "@es",
        type: "Flag",
        countryCode: "ES",
      },
      {
        id: "ar",
        label: "Argentina",
        supportingText: "@ar",
        type: "Flag",
        countryCode: "AR",
      },
    ],
  }),
];
