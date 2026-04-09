import clsx from "clsx";
import {
  CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS,
  CIRCLE_PROGRESS_BAR_LABEL_SIZES,
} from "./circleProgressBarLabelConfig.js";

const CIRCLE_PROGRESS_BAR_LABEL_NODE_IDS = {
  S: {
    20: "2174:37037",
    50: "2174:37039",
    80: "2174:37052",
    100: "2174:37065",
  },
  M: {
    20: "2175:34097",
  },
  L: {
    20: "2175:34110",
  },
};

const CIRCLE_PROGRESS_BAR_SIZE_STYLES = {
  S: {
    circleSize: 64,
    strokeWidth: 6,
    valueTextClassName: "text-heading-8 tracking-[-0.5px]",
    titleClassName: "text-heading-8 tracking-[-0.5px]",
    descriptionClassName:
      "text-[12px] leading-[14px] tracking-[-0.5px] max-w-[220px]",
  },
  M: {
    circleSize: 96,
    strokeWidth: 10,
    valueTextClassName: "text-[21px] leading-[25.5px] font-medium tracking-[-0.75px]",
    titleClassName: "text-[16px] leading-[19px] font-bold tracking-[-0.5px]",
    descriptionClassName:
      "text-[14px] leading-[17px] tracking-[-0.5px] max-w-[220px]",
  },
  L: {
    circleSize: 192,
    strokeWidth: 14,
    valueTextClassName: "text-[42px] leading-[51px] font-medium tracking-[-1.5px]",
    titleClassName: "text-heading-4 tracking-[-0.5px]",
    descriptionClassName:
      "text-[16px] leading-[19px] tracking-[-0.5px] max-w-[220px]",
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getPercentage(value, max) {
  const safeMax = typeof max === "number" && max > 0 ? max : 100;
  const safeValue = typeof value === "number" ? value : 0;

  return clamp((safeValue / safeMax) * 100, 0, 100);
}

function getRoundedPercentage(percentage) {
  return Math.round(percentage);
}

function getNodeId(size, roundedPercentage) {
  return CIRCLE_PROGRESS_BAR_LABEL_NODE_IDS[size]?.[roundedPercentage];
}

function CircleProgressBarLabel({
  className,
  "aria-label": ariaLabel = CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS["aria-label"],
  title = CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS.title,
  description = CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS.description,
  value = CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS.value,
  max = CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS.max,
  size = CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS.size,
  showText = CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS.showText,
  ...props
}) {
  const resolvedSize = CIRCLE_PROGRESS_BAR_LABEL_SIZES.includes(size)
    ? size
    : CIRCLE_PROGRESS_BAR_LABEL_DEFAULT_PROPS.size;
  const sizeStyles = CIRCLE_PROGRESS_BAR_SIZE_STYLES[resolvedSize];
  const percentage = getPercentage(value, max);
  const roundedPercentage = getRoundedPercentage(percentage);
  const normalizedValue = clamp(value, 0, max);
  const circleRadius = (sizeStyles.circleSize - sizeStyles.strokeWidth) / 2;
  const circumference = 2 * Math.PI * circleRadius;
  const dashOffset = circumference - (percentage / 100) * circumference;
  const viewBox = `0 0 ${sizeStyles.circleSize} ${sizeStyles.circleSize}`;

  return (
    <div
      className={clsx(
        "flex items-center justify-center gap-[16px]",
        resolvedSize === "L" && "w-full",
        className,
      )}
      data-node-id={getNodeId(resolvedSize, roundedPercentage)}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={normalizedValue}
      aria-valuetext={`${roundedPercentage}%`}
      {...props}
    >
      <div
        className="relative shrink-0"
        style={{
          width: `${sizeStyles.circleSize}px`,
          height: `${sizeStyles.circleSize}px`,
        }}
      >
        <svg
          viewBox={viewBox}
          className="size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={sizeStyles.circleSize / 2}
            cy={sizeStyles.circleSize / 2}
            r={circleRadius}
            fill="none"
            stroke="var(--color-neutral-200)"
            strokeWidth={sizeStyles.strokeWidth}
            className="dark:stroke-[var(--color-neutral-300)]"
          />
          <circle
            cx={sizeStyles.circleSize / 2}
            cy={sizeStyles.circleSize / 2}
            r={circleRadius}
            fill="none"
            stroke="var(--color-text-300)"
            strokeWidth={sizeStyles.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap={percentage >= 99.5 ? "butt" : "round"}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={clsx(
              "font-medium text-[var(--color-text-300)]",
              sizeStyles.valueTextClassName,
            )}
          >
            {roundedPercentage}%
          </span>
        </div>
      </div>

      {showText ? (
        <div className="flex flex-col justify-center gap-[4px] self-stretch">
          <span
            className={clsx(
              "font-medium text-[var(--color-text-300)]",
              resolvedSize !== "S" && "font-bold",
              sizeStyles.titleClassName,
            )}
          >
            {title}
          </span>
          <span
            className={clsx(
              "font-normal text-[var(--color-text-200)] dark:text-[var(--color-text-300)]",
              sizeStyles.descriptionClassName,
            )}
          >
            {description}
          </span>
        </div>
      ) : null}

    </div>
  );
}

export default CircleProgressBarLabel;
