export const LIST_ITEM_TYPES = ["Default", "Upload file"];
export const LIST_ITEM_STATES = ["Default", "Hover"];

export const LIST_ITEM_DEFAULT_PROPS = {
  type: "Default",
  state: undefined,
  interactive: false,
  authorName: "Jonh Doe",
  timestamp: "Hace 2 minutos",
  activityLabel: "Comentó",
  uploadPrefix: "subió un archivo de",
  projectLabel: "Stand Nexar 2026",
  comment: "El cliente aprobó esta versión",
  showMessage: true,
  showComment: true,
  showButtons: false,
  primaryActionLabel: "Ver más",
  secondaryActionLabel: "Ignorar",
  fileName: "Archivo.pdf",
  fileSize: "200KB",
  fileType: "PDF",
  avatarName: "Jonh Doe",
  avatarSrc: null,
  avatarInitials: "",
  "aria-label": "List item",
};

export function createListItemProps(overrides = {}) {
  return {
    ...LIST_ITEM_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createListItemShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createListItemProps(overrides),
  };
}
