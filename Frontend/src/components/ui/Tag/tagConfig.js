export const TAG_DEFAULT_PROPS = {
  label: "Label",
  size: "M",
  type: "Universal tag",
  avatar: true,
  checkbox: false,
  closeIcon: true,
  count: true,
  dotIndicator: false,
  flag: false,
  countValue: "5",
  countryCode: "IN",
  avatarText: "A",
};

export const TAG_SIZE_STYLES = {
  S: {
    container:
      "h-[20px] gap-[var(--spacing-gap-1)] px-[var(--spacing-gap-1)] py-[2px]",
    text: "text-body-4",
    countText: "text-body-5",
    icon: "size-3",
    indicator: "size-4",
    avatar: "size-4",
    checkbox: "size-4 rounded-[4px]",
  },
  M: {
    container:
      "h-[24px] gap-[var(--spacing-gap-1)] p-[var(--spacing-gap-1)]",
    text: "text-body-4",
    countText: "text-body-5",
    icon: "size-3",
    indicator: "size-4",
    avatar: "size-4",
    checkbox: "size-4 rounded-[4px]",
  },
  L: {
    container:
      "h-[29.333px] gap-[var(--spacing-gap-1)] p-[var(--spacing-gap-1)]",
    text: "text-body-3",
    countText: "text-body-5",
    icon: "size-[14px]",
    indicator: "size-4",
    avatar: "h-[21.333px] w-[21.333px]",
    checkbox: "size-5 rounded-[6px]",
  },
};

export const TAG_BASE_STYLES =
  "inline-flex items-center rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-text-300)] tracking-[-0.5px]";

export function createTagProps(overrides = {}) {
  return {
    ...TAG_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createTagShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createTagProps(overrides),
  };
}
