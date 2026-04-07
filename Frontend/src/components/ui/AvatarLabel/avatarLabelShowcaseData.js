import {
  createAvatarLabelProps,
  createAvatarLabelShowcaseItem,
} from "./avatarLabelConfig.js";

export const avatarLabelMainComponent = createAvatarLabelProps({
  size: "M",
  showLabel: true,
  showSubtitle: true,
});

export const avatarLabelQuickToggleItems = [
  {
    ...createAvatarLabelShowcaseItem("Base", {
      size: "M",
      showLabel: false,
      showSubtitle: false,
    }),
    previewWidthClassName: "w-[72px]",
  },
  {
    ...createAvatarLabelShowcaseItem("Label", {
      size: "M",
      showLabel: true,
      showSubtitle: false,
    }),
    previewWidthClassName: "w-[165px]",
  },
  {
    ...createAvatarLabelShowcaseItem("Label with Subtitle", {
      size: "M",
      showLabel: true,
      showSubtitle: true,
    }),
    previewWidthClassName: "w-[166px]",
  },
];

export const avatarLabelSizeItems = [
  {
    ...createAvatarLabelShowcaseItem("S", {
      size: "S",
      showLabel: true,
      showSubtitle: false,
    }),
    previewWidthClassName: "w-[132px]",
  },
  {
    ...createAvatarLabelShowcaseItem("M", {
      size: "M",
      showLabel: true,
      showSubtitle: true,
    }),
    previewWidthClassName: "w-[166px]",
  },
  {
    ...createAvatarLabelShowcaseItem("L", {
      size: "L",
      showLabel: true,
      showSubtitle: true,
    }),
    previewWidthClassName: "w-[182px]",
  },
];
