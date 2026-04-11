export const EMPTY_STATE_SIZES = ["S", "M"];

export const EMPTY_STATE_DEFAULT_PROPS = {
  title: "Título Principal",
  description:
    "Lorem ipsum dolor sit amet feugiat platea risus tortor maecenas.",
  primaryActionLabel: "Actualizar",
  secondaryActionLabel: "Añadir",
  size: "S",
  showFeaturedIcon: true,
  showActions: true,
  "aria-label": "Empty state",
};

export function createEmptyStateProps(overrides = {}) {
  return {
    ...EMPTY_STATE_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createEmptyStateShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createEmptyStateProps(overrides),
  };
}
