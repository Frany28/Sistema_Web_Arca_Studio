export const CHECKBOX_SIZES = ["S", "M"];
export const CHECKBOX_CHECKED_STATES = ["Yes", "Indeterminate", "No"];
export const CHECKBOX_STATES = ["Default", "Hover", "Focused", "Disabled"];

export const CHECKBOX_DEFAULT_PROPS = {
  checked: "Yes",
  size: "M",
  state: undefined,
  interactive: false,
  disabled: false,
};

export const CHECKBOX_SIZE_STYLES = {
  S: {
    wrapper: "size-4",
    icon: "size-3",
  },
  M: {
    wrapper: "size-5",
    icon: "size-[14px]",
  },
};

export function createCheckboxProps(overrides = {}) {
  return {
    ...CHECKBOX_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createCheckboxShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createCheckboxProps(overrides),
  };
}
