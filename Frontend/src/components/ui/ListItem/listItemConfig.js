export const LIST_ITEM_DEFAULT_PROPS = {
  name: "Jonh Doe",
  action: "Comentó",
  badgeLabel: "Stand Nexar 2026",
  description: "El cliente aprobó esta versión",
  timestamp: "Hace 2 minutos",
  showBadge: true,
  showDivider: true,
  showActions: false,
  state: "Default",
  primaryActionLabel: "Ver más",
  secondaryActionLabel: "Ignorar",
  avatarProps: {
    size: "M",
    style: "Icon",
    theme: "Brand 1",
    decorative: true,
  },
};

export function createListItemProps(overrides = {}) {
  return {
    ...LIST_ITEM_DEFAULT_PROPS,
    ...overrides,
    avatarProps: {
      ...LIST_ITEM_DEFAULT_PROPS.avatarProps,
      ...(overrides.avatarProps ?? {}),
    },
  };
}

export function createListItemShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createListItemProps(overrides),
  };
}
