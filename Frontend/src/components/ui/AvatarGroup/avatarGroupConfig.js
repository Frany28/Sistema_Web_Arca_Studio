export const AVATAR_GROUP_DEFAULT_ITEMS = [
  { content: "Icon", theme: "Neutral" },
  { content: "Icon", theme: "Neutral" },
  { content: "Icon", theme: "Neutral" },
  { content: "Text", theme: "Neutral", name: "Karen Espinoza" },
];

export const AVATAR_GROUP_DEFAULT_PROPS = {
  size: "S",
  items: AVATAR_GROUP_DEFAULT_ITEMS,
  overlap: 6,
  moreCount: null,
};

export const AVATAR_GROUP_SIZE_STYLES = {
  S: {
    container: "pr-[6px]",
    border: "border",
    margin: "-ml-[6px]",
    previewWidthClassName: "w-[110px]",
  },
  M: {
    container: "pr-[6px]",
    border: "border-2",
    margin: "-ml-[6px]",
    previewWidthClassName: "w-[174px]",
  },
  L: {
    container: "pr-[6px]",
    border: "border-2",
    margin: "-ml-[6px]",
    previewWidthClassName: "w-[238px]",
  },
};

export function createAvatarGroupProps(overrides = {}) {
  return {
    ...AVATAR_GROUP_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createAvatarGroupShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createAvatarGroupProps(overrides),
  };
}
