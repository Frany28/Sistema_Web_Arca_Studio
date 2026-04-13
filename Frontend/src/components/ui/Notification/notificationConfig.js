export const NOTIFICATION_LEADING_TYPES = ["Featured icon", "Avatar"];

export const NOTIFICATION_DEFAULT_PROPS = {
  title: "Esto es una notificación!",
  timestamp: "Hace 2 min",
  description:
    "Lorem ipsum dolor sit amet porta enim integer faucibus tincidunt.",
  leadingType: "Featured icon",
  showCloseButton: true,
  showActions: true,
  secondaryActionLabel: "Descartar",
  primaryActionLabel: "Ver cambios",
  visible: undefined,
  defaultVisible: true,
  "aria-label": "Notification",
};

export function createNotificationProps(overrides = {}) {
  return {
    ...NOTIFICATION_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createNotificationShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createNotificationProps(overrides),
  };
}
