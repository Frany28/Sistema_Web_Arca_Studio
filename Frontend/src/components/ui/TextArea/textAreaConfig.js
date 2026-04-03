export const TEXT_AREA_DEFAULT_PROPS = {
  label: "Description",
  hintText: "Texto de ayuda para los usuarios",
  placeholder: "Texto de prueba",
  state: "Default",
  showLabel: true,
  showHint: true,
  showLabelInfo: true,
  required: false,
  disabled: false,
  rows: 5,
  minHeight: 130,
  resize: false,
};

export const TEXT_AREA_STATE_STYLES = {
  Default: {
    shell:
      "border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-none",
    field:
      "border border-transparent bg-transparent",
    text: "text-[var(--color-text-100)] placeholder:text-[var(--color-text-100)]",
    labelState: "Default",
    hintState: "Default",
    handle: "text-[var(--color-neutral-300)]",
  },
  Hover: {
    shell:
      "border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04)]",
    field:
      "border border-transparent bg-[var(--color-neutral-100)]",
    text: "text-[var(--color-text-300)] placeholder:text-[var(--color-text-100)]",
    labelState: "Default",
    hintState: "Default",
    handle: "text-[var(--color-neutral-300)]",
  },
  Focused: {
    shell:
      "border-[4px] border-[var(--color-primary-10)] bg-[var(--color-neutral-100)] shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04)]",
    field:
      "border border-[var(--color-primary-300)] bg-transparent",
    text: "text-[var(--color-text-300)] placeholder:text-[var(--color-text-100)]",
    labelState: "Default",
    hintState: "Default",
    handle: "text-[var(--color-neutral-300)]",
  },
  Filled: {
    shell:
      "border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-none",
    field:
      "border border-transparent bg-transparent",
    text: "text-[var(--color-text-200)] placeholder:text-[var(--color-text-100)]",
    labelState: "Default",
    hintState: "Default",
    handle: "text-[var(--color-neutral-300)]",
  },
  Disabled: {
    shell:
      "border border-[var(--color-neutral-300)] bg-[var(--color-neutral-200)] shadow-none",
    field:
      "border border-[var(--color-neutral-400)] bg-transparent",
    text: "text-[var(--color-neutral-400)] placeholder:text-[var(--color-neutral-400)]",
    labelState: "Disabled",
    hintState: "Disabled",
    handle: "text-[var(--color-neutral-400)]",
  },
  Error: {
    shell:
      "bg-[var(--color-neutral-100)] shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04)]",
    field:
      "border border-[var(--color-danger-100)] bg-transparent",
    text: "text-[var(--color-text-200)] placeholder:text-[var(--color-text-100)]",
    labelState: "Default",
    hintState: "Error",
    handle: "text-[var(--color-danger-100)]",
  },
};

export const TEXT_AREA_INTERACTIVE_STYLES =
  "hover:border-[var(--color-neutral-200)] hover:shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04)] focus-within:border-[4px] focus-within:border-[var(--color-primary-10)] focus-within:shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04)]";

export function createTextAreaProps(overrides = {}) {
  return {
    ...TEXT_AREA_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createTextAreaShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createTextAreaProps(overrides),
  };
}
