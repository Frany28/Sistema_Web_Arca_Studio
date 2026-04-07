export const PAGINATION_DOTS_TYPES = ["Dot", "Line", "Both"];

export const PAGINATION_DOTS_DEFAULT_PROPS = {
  count: 3,
  activeIndex: 0,
  type: "Both",
  interactive: false,
};

export const PAGINATION_DOTS_ATOM_STYLES = {
  Dot: "size-[8px]",
  Line: "h-[8px] w-[32px]",
};

export function createPaginationDotsProps(overrides = {}) {
  return {
    ...PAGINATION_DOTS_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createPaginationDotsShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createPaginationDotsProps(overrides),
  };
}
