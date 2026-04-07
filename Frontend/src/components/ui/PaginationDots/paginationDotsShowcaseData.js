import {
  createPaginationDotsProps,
  createPaginationDotsShowcaseItem,
} from "./paginationDotsConfig.js";

export const paginationDotsMainComponent = createPaginationDotsProps({
  count: 3,
  activeIndex: 0,
  type: "Both",
});

export const paginationDotsTypeItems = [
  {
    ...createPaginationDotsShowcaseItem("Dot", {
      count: 3,
      activeIndex: 0,
      type: "Dot",
    }),
    previewWidthClassName: "w-[96px]",
  },
  {
    ...createPaginationDotsShowcaseItem("Line", {
      count: 3,
      activeIndex: 0,
      type: "Line",
    }),
    previewWidthClassName: "w-[168px]",
  },
  {
    ...createPaginationDotsShowcaseItem("Both", {
      count: 3,
      activeIndex: 0,
      type: "Both",
    }),
    previewWidthClassName: "w-[120px]",
  },
];
