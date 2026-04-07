export const ACCORDION_STATES = ["Default", "Hover", "Open"];

export const ACCORDION_DEFAULT_PROPS = {
  title: "Los títulos del acordeón van aquí",
  description:
    "La descripción del acordeón va aquí, se debe intentar mantenerla en menos de 2 líneas.",
  state: "Default",
  interactive: false,
  showRightIcon: true,
  defaultOpen: false,
};

export const ACCORDION_STATE_STYLES = {
  Default: {
    container:
      "border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]",
    alignment: "items-center",
  },
  Hover: {
    container:
      "border border-transparent bg-[var(--color-primary-10)] dark:bg-[var(--color-primary-100)]",
    alignment: "items-center",
  },
  Open: {
    container:
      "border border-transparent bg-[var(--color-primary-10)] dark:bg-[var(--color-primary-100)]",
    alignment: "items-start",
  },
};

export function createAccordionProps(overrides = {}) {
  return {
    ...ACCORDION_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createAccordionShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createAccordionProps(overrides),
  };
}
