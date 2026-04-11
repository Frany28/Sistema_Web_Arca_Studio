import clsx from "clsx";
import ProgressStepBase from "../ProgressStepBase.jsx";
import {
  createProgressStepGroupItems,
  PROGRESS_STEP_GROUP_DEFAULT_PROPS,
} from "./progressStepGroupConfig.js";

const PROGRESS_STEP_GROUP_NODE_IDS = {
  light: "2175:33382",
  dark: "2056:23031",
};

const CONNECTOR_LAYOUT_BY_SIZE = {
  S: {
    left: "left-[152px]",
    right: "right-[152px]",
    top: "top-[16px]",
    width: "w-[396px]",
  },
  M: {
    left: "left-[162px]",
    right: "right-[162px]",
    top: "top-[19px]",
    width: "w-[386px]",
  },
  L: {
    left: "left-[172px]",
    right: "right-[172px]",
    top: "top-[23px]",
    width: "w-[376px]",
  },
};

const STEP_STACK_GAP_BY_SIZE = {
  S: "gap-[8px]",
  M: "gap-[8px]",
  L: "gap-[12px]",
};

function getDocumentDarkMode() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.classList.contains("dark");
}

function ProgressStepGroup({
  className,
  type = PROGRESS_STEP_GROUP_DEFAULT_PROPS.type,
  size = PROGRESS_STEP_GROUP_DEFAULT_PROPS.size,
  items,
  "aria-label": ariaLabel = PROGRESS_STEP_GROUP_DEFAULT_PROPS["aria-label"],
  ...props
}) {
  const resolvedItems =
    Array.isArray(items) && items.length === 3
      ? items
      : createProgressStepGroupItems(type, size);
  const isDarkMode = getDocumentDarkMode();
  const showsConnectors = type !== "Line text";
  const connectorLayout =
    CONNECTOR_LAYOUT_BY_SIZE[size] ?? CONNECTOR_LAYOUT_BY_SIZE.L;
  const stepStackGapClass = STEP_STACK_GAP_BY_SIZE[size] ?? STEP_STACK_GAP_BY_SIZE.L;

  return (
    <div
      className={clsx(
        "relative flex w-[976px] max-w-full items-center gap-[24px]",
        className,
      )}
      data-node-id={
        isDarkMode ? PROGRESS_STEP_GROUP_NODE_IDS.dark : PROGRESS_STEP_GROUP_NODE_IDS.light
      }
      aria-label={ariaLabel}
      {...props}
    >
      {showsConnectors ? (
        <>
          <div
            className={clsx(
              "pointer-events-none absolute h-[2px] bg-[var(--color-text-300)]",
              connectorLayout.left,
              connectorLayout.top,
              connectorLayout.width,
            )}
          />
          <div
            className={clsx(
              "pointer-events-none absolute h-[2px] bg-[var(--color-neutral-200)]",
              connectorLayout.right,
              connectorLayout.top,
              connectorLayout.width,
            )}
          />
        </>
      ) : null}

      {resolvedItems.map((item, index) => (
        <div
          key={`${item.title}-${item.state}-${index}`}
          className={clsx(
            "relative z-10 flex min-w-0 flex-1 flex-col items-center",
            stepStackGapClass,
          )}
        >
          <ProgressStepBase {...item} />
        </div>
      ))}
    </div>
  );
}

export default ProgressStepGroup;
