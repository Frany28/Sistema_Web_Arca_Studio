export const CIRCLE_PROGRESS_BAR_LABEL_SIZES = ["S", "M", "L"];

export const CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS = {
  title: "Título",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  value: 20,
  max: 100,
  size: "S",
  showText: true,
  "aria-label": "Circle progress bar label",
};

export function createCircleProgressBarLabelProps(overrides = {}) {
  return {
    ...CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createCircleProgressBarLabelShowcaseItem(
  label,
  overrides = {},
) {
  return {
    label,
    props: createCircleProgressBarLabelProps(overrides),
  };
}
