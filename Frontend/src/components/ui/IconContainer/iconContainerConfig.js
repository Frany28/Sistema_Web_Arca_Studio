export const ICON_CONTAINER_DEFAULT_PROPS = {
  size: "S",
  type: "Outline",
};

export const ICON_CONTAINER_SIZE_STYLES = {
  S: {
    container: "size-8 p-[var(--spacing-gap-3)]",
    icon: 16,
  },
  M: {
    container: "size-10 p-[var(--spacing-gap-3)]",
    icon: 20,
  },
  L: {
    container: "size-12 p-[var(--spacing-gap-3)]",
    icon: 24,
  },
  XL: {
    container: "size-14 p-[var(--spacing-gap-3)]",
    icon: 28,
  },
};

export const ICON_CONTAINER_TYPE_STYLES = {
  Outline:
    "border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-text-100)] shadow-[var(--shadow-e1)]",
  Fill:
    "border border-transparent bg-[var(--color-primary-300)] text-[var(--color-neutral-100-uniform)] shadow-[var(--shadow-e1)]",
  Ghost: "border border-transparent bg-transparent text-[var(--color-text-100)] shadow-none",
};

export function createIconContainerProps(overrides = {}) {
  return {
    ...ICON_CONTAINER_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createIconContainerShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createIconContainerProps(overrides),
  };
}
