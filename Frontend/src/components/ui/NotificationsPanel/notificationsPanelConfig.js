export const NOTIFICATIONS_PANEL_DEFAULT_ITEMS = [
  {
    id: 1,
    name: "Jonh Doe",
    actionText: "modificó el estado de",
    targetLabel: "Stand Nexar 2026.",
    description: "",
    timestamp: "Hace 2 minutos",
    showActions: true,
    showFile: false,
    primaryActionLabel: "Ver más",
    secondaryActionLabel: "Ignorar",
  },
  {
    id: 2,
    name: "Jonh Doe",
    actionText: "subió un archivo de",
    targetLabel: "Stand Nexar 2026.",
    description: "",
    timestamp: "Hace 30 minutos",
    showActions: false,
    showFile: true,
    fileType: "PDF",
    fileName: "Archivo.pdf",
    fileSize: "200KB",
  },
  {
    id: 3,
    name: "Jonh Doe",
    actionText: "modificó el estado de",
    targetLabel: "Stand Nexar 2026.",
    description: "",
    timestamp: "Hace 2 minutos",
    showActions: true,
    showFile: false,
    primaryActionLabel: "Ver más",
    secondaryActionLabel: "Ignorar",
  },
];

export const NOTIFICATIONS_PANEL_DEFAULT_PROPS = {
  title: "Notificaciones",
  actionLabel: "Marcar todo como leído",
  footerLabel: "Ver todas las notificaciones",
  items: NOTIFICATIONS_PANEL_DEFAULT_ITEMS,
};

export function createNotificationsPanelProps(overrides = {}) {
  return {
    ...NOTIFICATIONS_PANEL_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createNotificationsPanelShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createNotificationsPanelProps(overrides),
  };
}
