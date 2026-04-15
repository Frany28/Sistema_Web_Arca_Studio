export const COMMENT_PANEL_DEFAULT_ITEMS = [
  {
    id: 1,
    name: "Jonh Doe",
    action: "Comentó",
    badgeLabel: "Stand Nexar 2026.",
    description: "Podemos ajustar la iluminación en este render?",
    timestamp: "Hace 2 minutos",
    showBadge: true,
  },
  {
    id: 2,
    name: "Jonh Doe",
    action: "Comentó",
    badgeLabel: "Stand Nexar 2026.",
    description: "El cliente aprobó esta versión",
    timestamp: "Hace 3 días",
    showBadge: true,
  },
  {
    id: 3,
    name: "Jonh Doe",
    action: "Comentó",
    badgeLabel: "Stand Nexar 2026.",
    description: "Revisar colores del logo aquí",
    timestamp: "Feb 23",
    showBadge: true,
  },
];

export const COMMENT_PANEL_DEFAULT_PROPS = {
  title: "Comentarios",
  actionLabel: "Marcar todo como leído",
  footerLabel: "Ver todos los comentarios",
  items: COMMENT_PANEL_DEFAULT_ITEMS,
};

export function createCommentPanelProps(overrides = {}) {
  return {
    ...COMMENT_PANEL_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createCommentPanelShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createCommentPanelProps(overrides),
  };
}
