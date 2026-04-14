import { useId, useState } from "react";
import clsx from "clsx";
import { TOOLTIP_DEFAULT_PROPS, TOOLTIP_POSITIONS } from "./tooltipConfig.js";

const TOOLTIP_NODE_IDS = {
  base: "2061:19961",
  withSubtext: "2061:19975",
  withTip: "2061:19968",
  main: "2061:19982",
  positions: {
    Right: "2061:25049",
    Left: "2061:25055",
    "Top center": "2061:25061",
    "Top right": "2061:25067",
    "Top left": "2061:25073",
    "Bottom center": "2061:25079",
    "Bottom right": "2061:25085",
    "Bottom left": "2061:25091",
  },
};

const TOOLTIP_TAIL_CLASSNAMES = {
  Right: "right-[-10px] bottom-[6px]",
  Left: "left-[-10px] bottom-[6px]",
  "Top center": "right-[102px] top-[-8.512px]",
  "Top right": "right-[6px] top-[-8.512px]",
  "Top left": "left-[6px] top-[-8.512px]",
  "Bottom center": "right-[102px] bottom-[-8.512px]",
  "Bottom right": "right-[6px] bottom-[-8.512px]",
  "Bottom left": "left-[6px] bottom-[-8.512px]",
};

const TOOLTIP_BUBBLE_CLASSNAMES = {
  Right: "left-full ml-[12px] top-1/2 -translate-y-1/2",
  Left: "right-full mr-[12px] top-1/2 -translate-y-1/2",
  "Top center": "bottom-full left-1/2 mb-[12px] -translate-x-1/2",
  "Top right": "bottom-full right-0 mb-[12px]",
  "Top left": "bottom-full left-0 mb-[12px]",
  "Bottom center": "left-1/2 top-full mt-[12px] -translate-x-1/2",
  "Bottom right": "right-0 top-full mt-[12px]",
  "Bottom left": "left-0 top-full mt-[12px]",
};

const TOOLTIP_TAIL_TRANSFORMS = {
  Right: "rotate-90",
  Left: "-scale-y-100 rotate-90",
  "Top center": "",
  "Top right": "",
  "Top left": "",
  "Bottom center": "-scale-y-100",
  "Bottom right": "-scale-y-100",
  "Bottom left": "-scale-y-100",
};

function TooltipTail({ tipPosition }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[16px] w-[20px] items-center justify-center",
        TOOLTIP_TAIL_TRANSFORMS[tipPosition],
      )}
    >
      <svg
        viewBox="0 0 20 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-[16px] w-[20px] drop-shadow-[0_0_5px_rgba(0,0,0,0.10)]"
        aria-hidden="true"
      >
        <path
          d="M10.7832 2.54004C10.1845 1.71045 8.94831 1.71045 8.34961 2.54004L3.59961 9.12207C2.88366 10.1141 3.59299 11.5 4.81641 11.5L14.3164 11.5C15.5398 11.5 16.2492 10.1141 15.5332 9.12207L10.7832 2.54004Z"
          fill="var(--color-neutral-100)"
          stroke="var(--color-neutral-200)"
        />
        <rect
          width="16.5612"
          height="4.91549"
          transform="matrix(1 0 0 -1 1.71875 13.4258)"
          fill="var(--color-neutral-100)"
        />
      </svg>
    </span>
  );
}

function getResolvedPosition(tipPosition) {
  return TOOLTIP_POSITIONS.includes(tipPosition)
    ? tipPosition
    : TOOLTIP_DEFAULT_PROPS.tipPosition;
}

function getResolvedNodeId({ tipPosition, showSubtext, showTip }) {
  if (showSubtext && showTip && tipPosition === "Bottom center") {
    return TOOLTIP_NODE_IDS.main;
  }

  if (showSubtext) {
    return TOOLTIP_NODE_IDS.withSubtext;
  }

  if (showTip) {
    return TOOLTIP_NODE_IDS.positions[tipPosition] ?? TOOLTIP_NODE_IDS.withTip;
  }

  return TOOLTIP_NODE_IDS.base;
}

function TooltipBubble({
  className,
  text,
  subtext,
  showSubtext,
  showTip,
  tipPosition,
  tooltipId,
  ...props
}) {
  const resolvedPosition = getResolvedPosition(tipPosition);
  const tailClassName = TOOLTIP_TAIL_CLASSNAMES[resolvedPosition];

  return (
    <div
      id={tooltipId}
      role="tooltip"
      className={clsx(
        "relative flex w-[224px] flex-col items-start gap-[2px] rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[8px] shadow-[var(--shadow-e2)] transition-colors duration-200",
        className,
      )}
      data-node-id={getResolvedNodeId({
        tipPosition: resolvedPosition,
        showSubtext,
        showTip,
      })}
      {...props}
    >
      <p className="w-full text-heading-8 text-[var(--color-text-200)]">
        {text}
      </p>

      {showSubtext ? (
        <p className="w-full text-body-4 text-[var(--color-text-100)]">
          {subtext}
        </p>
      ) : null}

      {showTip ? (
        <span
          className={clsx(
            "absolute inline-flex h-[16px] w-[20px] items-center justify-center",
            tailClassName,
          )}
          aria-hidden="true"
        >
          <TooltipTail tipPosition={resolvedPosition} />
        </span>
      ) : null}
    </div>
  );
}

function Tooltip({
  className,
  text = TOOLTIP_DEFAULT_PROPS.text,
  subtext = TOOLTIP_DEFAULT_PROPS.subtext,
  showSubtext = TOOLTIP_DEFAULT_PROPS.showSubtext,
  showTip = TOOLTIP_DEFAULT_PROPS.showTip,
  tipPosition = TOOLTIP_DEFAULT_PROPS.tipPosition,
  open = TOOLTIP_DEFAULT_PROPS.open,
  defaultOpen = TOOLTIP_DEFAULT_PROPS.defaultOpen,
  children,
  onOpenChange,
  "aria-label": ariaLabel = TOOLTIP_DEFAULT_PROPS["aria-label"],
  ...props
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const tooltipId = useId();
  const isOpenControlled = typeof open === "boolean";
  const resolvedOpen = isOpenControlled ? open : internalOpen;
  const resolvedPosition = getResolvedPosition(tipPosition);

  const setTooltipOpen = (nextOpen) => {
    if (!isOpenControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  if (!children) {
    return (
      <TooltipBubble
        className={className}
        text={text}
        subtext={subtext}
        showSubtext={showSubtext}
        showTip={showTip}
        tipPosition={resolvedPosition}
        tooltipId={tooltipId}
        aria-label={ariaLabel}
        {...props}
      />
    );
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
      onFocusCapture={() => setTooltipOpen(true)}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
          return;
        }

        setTooltipOpen(false);
      }}
    >
      <span aria-describedby={resolvedOpen ? tooltipId : undefined}>
        {children}
      </span>

      {resolvedOpen ? (
        <span
          className={clsx(
            "pointer-events-none absolute z-20",
            TOOLTIP_BUBBLE_CLASSNAMES[resolvedPosition],
          )}
        >
          <TooltipBubble
            className={className}
            text={text}
            subtext={subtext}
            showSubtext={showSubtext}
            showTip={showTip}
            tipPosition={resolvedPosition}
            tooltipId={tooltipId}
            aria-label={ariaLabel}
            {...props}
          />
        </span>
      ) : null}
    </span>
  );
}

export default Tooltip;
