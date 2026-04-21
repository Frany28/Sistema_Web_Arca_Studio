export const MODAL_MOUNTS = ["viewport", "contained"];
export const MODAL_ALIGNMENTS = ["Left", "Centered", "Horizontal split"];
export const MODAL_OVERLAY_VARIANTS = ["blurred", "transparent"];
export const MODAL_TRANSITION_PRESETS = ["none", "fade-scale"];

export const MODAL_DEFAULT_PROPS = {
  mount: "viewport",
  visible: true,
  alignment: "Left",
  overlayVariant: "blurred",
  transitionPreset: "fade-scale",
  showDialog: false,
  title: "Título aquí",
  description:
    "Horem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
  primaryActionLabel: "Siguiente",
  secondaryActionLabel: "Cerrar",
  checkboxLabel: "No volver a mostrar",
  showCloseButton: true,
};

export function createModalProps(overrides = {}) {
  return {
    ...MODAL_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createModalShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createModalProps(overrides),
  };
}
