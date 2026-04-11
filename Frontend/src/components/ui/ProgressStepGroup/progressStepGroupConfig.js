export const PROGRESS_STEP_GROUP_TYPES = [
  "Line text",
  "Numbered",
  "Featured Icon",
];

export function createProgressStepGroupItems(type = "Numbered", size = "L") {
  return [
    {
      title: "Title goes here",
      subtext: "Subdescription goes here",
      type,
      state: "Completed",
      size,
    },
    {
      title: "Title goes here",
      subtext: "Subdescription goes here",
      type,
      state: "Active",
      size,
    },
    {
      title: "Title goes here",
      subtext: "Subdescription goes here",
      type,
      state: "Incomplete",
      size,
    },
  ];
}

export const PROGRESS_STEP_GROUP_DEFAULT_ITEMS =
  createProgressStepGroupItems();

export const PROGRESS_STEP_GROUP_DEFAULT_PROPS = {
  type: "Numbered",
  size: "L",
  items: PROGRESS_STEP_GROUP_DEFAULT_ITEMS,
  "aria-label": "Progress step group",
};

export function createProgressStepGroupProps(overrides = {}) {
  return {
    ...PROGRESS_STEP_GROUP_DEFAULT_PROPS,
    ...overrides,
  };
}
