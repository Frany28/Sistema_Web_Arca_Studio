export const PROGRESS_STEP_BASE_TYPES = [
  "Line text",
  "Numbered",
  "Featured Icon",
];

export const PROGRESS_STEP_BASE_STATES = [
  "Incomplete",
  "Active",
  "Completed",
];

export const PROGRESS_STEP_BASE_SIZES = ["S", "M", "L"];

export const PROGRESS_STEP_BASE_DEFAULT_PROPS = {
  title: "Title goes here",
  subtext: "Subdescription goes here",
  type: "Numbered",
  state: "Completed",
  size: "M",
  showSubtext: true,
  number: "01",
  "aria-label": "Progress step base",
};

export function createProgressStepBaseProps(overrides = {}) {
  return {
    ...PROGRESS_STEP_BASE_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createProgressStepBaseShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createProgressStepBaseProps(overrides),
  };
}
