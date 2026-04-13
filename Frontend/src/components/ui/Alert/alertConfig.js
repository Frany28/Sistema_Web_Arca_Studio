export const ALERT_THEMES = [
  "Brand",
  "Warning",
  "Danger",
  "Success",
  "Info",
];

export const ALERT_LAYOUTS = ["Box", "Full width"];

export const ALERT_DEFAULT_PROPS = {
  title: "Título de la alerta",
  description:
    "Lorem ipsum dolor sit amet porta enim integer faucibus tincidunt.",
  theme: "Brand",
  layout: "Box",
  showIcon: true,
  showText: true,
  showActions: true,
  showCloseButton: true,
  visible: undefined,
  defaultVisible: true,
  secondaryActionLabel: "Descartar",
  primaryActionLabel: "Realizar cambios",
  "aria-label": "Alert",
};

export function createAlertProps(overrides = {}) {
  return {
    ...ALERT_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createAlertShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createAlertProps(overrides),
  };
}
