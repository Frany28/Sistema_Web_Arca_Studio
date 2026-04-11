import { createProgressStepGroupProps } from "./progressStepGroupConfig.js";

export const progressStepGroupMainComponent = createProgressStepGroupProps();

export const progressStepGroupTypeItems = [
  {
    label: "Line text",
    props: createProgressStepGroupProps({
      type: "Line text",
      items: undefined,
    }),
  },
  {
    label: "Numbered",
    props: createProgressStepGroupProps({
      type: "Numbered",
      items: undefined,
    }),
  },
  {
    label: "Featured Icon",
    props: createProgressStepGroupProps({
      type: "Featured Icon",
      items: undefined,
    }),
  },
];

export const progressStepGroupSizeItems = [
  {
    label: "S",
    props: createProgressStepGroupProps({
      type: "Featured Icon",
      size: "S",
      items: undefined,
    }),
  },
  {
    label: "M",
    props: createProgressStepGroupProps({
      type: "Featured Icon",
      size: "M",
      items: undefined,
    }),
  },
  {
    label: "L",
    props: createProgressStepGroupProps({
      type: "Featured Icon",
      size: "L",
      items: undefined,
    }),
  },
];

export const progressStepGroupProgressRows = [
  createProgressStepGroupProps({
    type: "Line text",
    size: "S",
    items: undefined,
  }),
  createProgressStepGroupProps({
    type: "Line text",
    size: "M",
    items: undefined,
  }),
  createProgressStepGroupProps({
    type: "Line text",
    size: "L",
    items: undefined,
  }),
  createProgressStepGroupProps({
    type: "Numbered",
    size: "S",
    items: undefined,
  }),
  createProgressStepGroupProps({
    type: "Numbered",
    size: "M",
    items: undefined,
  }),
  createProgressStepGroupProps({
    type: "Numbered",
    size: "L",
    items: undefined,
  }),
  createProgressStepGroupProps({
    type: "Featured Icon",
    size: "S",
    items: undefined,
  }),
  createProgressStepGroupProps({
    type: "Featured Icon",
    size: "M",
    items: undefined,
  }),
  createProgressStepGroupProps({
    type: "Featured Icon",
    size: "L",
    items: undefined,
  }),
];
