export const PROGRESS_BAR_LABEL_POSITIONS = ["top", "side"];

export const PROGRESS_BAR_LABEL_DEFAULT_PROPS = {
  title: "Título",
  sublabel: "Subtítulo aquí",
  value: 40,
  max: 100,
  position: "top",
  showTitle: true,
  showSublabel: true,
  "aria-label": "Progress bar label",
};

export function createProgressBarLabelProps(overrides = {}) {
  return {
    ...PROGRESS_BAR_LABEL_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createProgressBarLabelShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createProgressBarLabelProps(overrides),
  };
}
