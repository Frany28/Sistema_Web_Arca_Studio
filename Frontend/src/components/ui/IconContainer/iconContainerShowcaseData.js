import {
  createIconContainerProps,
  createIconContainerShowcaseItem,
} from "./iconContainerConfig.js";

export const iconContainerSizeItems = ["S", "M", "L", "XL"].map((size) =>
  createIconContainerShowcaseItem(size, { size }),
);

export const iconContainerTypeRows = [
  {
    label: "Outline",
    items: ["S", "M", "L", "XL"].map((size) =>
      createIconContainerShowcaseItem(size, {
        type: "Outline",
        size,
      }),
    ),
  },
  {
    label: "Fill",
    items: ["S", "M", "L", "XL"].map((size) =>
      createIconContainerShowcaseItem(size, {
        type: "Fill",
        size,
      }),
    ),
  },
  {
    label: "Ghost",
    items: ["S", "M", "L", "XL"].map((size) =>
      createIconContainerShowcaseItem(size, {
        type: "Ghost",
        size,
      }),
    ),
  },
];

export const iconContainerMainComponent = createIconContainerProps();
