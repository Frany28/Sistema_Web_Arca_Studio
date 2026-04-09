import { createModalProps, createModalShowcaseItem } from "./modalConfig.js";

export const modalMainComponent = createModalProps({
  mount: "contained",
  showDialog: true,
});

export const modalAlignmentItems = [
  createModalShowcaseItem("Left", {
    mount: "contained",
    showDialog: true,
    alignment: "Left",
  }),
  createModalShowcaseItem("Centered", {
    mount: "contained",
    showDialog: true,
    alignment: "Centered",
  }),
  createModalShowcaseItem("Horizontal split", {
    mount: "contained",
    showDialog: true,
    alignment: "Horizontal split",
    showCloseButton: false,
  }),
];
