import { createInputProps, createInputShowcaseItem } from "./inputConfig.js";

export const inputMainComponent = createInputProps({
  type: "Default input",
  size: "S",
  defaultValue: "Texto de prueba",
});

export const inputSizeItems = [
  createInputShowcaseItem("S", {
    size: "S",
    defaultValue: "Texto de prueba",
    showLabel: false,
    showHint: false,
    showLeftIcon: false,
    showRightIcon: false,
  }),
  createInputShowcaseItem("M", {
    size: "M",
    defaultValue: "Texto de prueba",
    showLabel: false,
    showHint: false,
    showLeftIcon: false,
    showRightIcon: false,
  }),
  createInputShowcaseItem("L", {
    size: "L",
    defaultValue: "Texto de prueba",
    showLabel: false,
    showHint: false,
    showLeftIcon: false,
    showRightIcon: false,
  }),
];

export const inputStateItems = [
  createInputShowcaseItem("Default", {
    state: "Default",
    defaultValue: "",
  }),
  createInputShowcaseItem("Hover", {
    state: "Hover",
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Focused", {
    state: "Focused",
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Filled", {
    state: "Filled",
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Disabled", {
    state: "Disabled",
    defaultValue: "Texto de prueba",
    disabled: true,
  }),
  createInputShowcaseItem("Error", {
    state: "Error",
    defaultValue: "Texto de prueba",
  }),
];

export const inputQuickToggleItems = [
  createInputShowcaseItem("Base", {
    size: "L",
    showLabel: false,
    showHint: false,
    showLeftIcon: false,
    showRightIcon: false,
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Label", {
    size: "L",
    showHint: false,
    showLeftIcon: false,
    showRightIcon: false,
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Hint text", {
    size: "L",
    showLabel: false,
    showLeftIcon: false,
    showRightIcon: false,
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Left icon", {
    size: "L",
    showLabel: false,
    showHint: false,
    showRightIcon: false,
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Right icon", {
    size: "L",
    showLabel: false,
    showHint: false,
    showLeftIcon: false,
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Password strength", {
    type: "Password",
    size: "L",
    showLeftIcon: false,
    showPasswordStrength: true,
    defaultValue: "Password1!",
    showHint: true,
    passwordHintTitle: "Must contain at least;",
    passwordRequirements: [
      { label: "At least 1 uppercase", met: true },
      { label: "At least 1 number", met: true },
      { label: "At least 8 character", met: true },
    ],
  }),
];

export const inputTypeItems = [
  createInputShowcaseItem("Default input", {
    type: "Default input",
    size: "L",
    defaultValue: "Texto de prueba",
  }),
  createInputShowcaseItem("Search bar", {
    type: "Search bar",
    size: "L",
    showRightIcon: false,
  }),
  createInputShowcaseItem("Password", {
    type: "Password",
    size: "L",
    defaultValue: "Password1!",
  }),
  createInputShowcaseItem("Tags", {
    type: "Tags",
    size: "L",
    tags: [],
  }),
  createInputShowcaseItem("Phone number", {
    type: "Phone number",
    size: "L",
    defaultValue: "(444) 1234-5678",
  }),
];
