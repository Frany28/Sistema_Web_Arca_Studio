import { useEffect, useState } from "react";
import clsx from "clsx";
import * as IconsaxIcons from "iconsax-react";
import Button from "../Button/Button.jsx";
import {
  EMPTY_STATE_DEFAULT_PROPS,
  EMPTY_STATE_SIZES,
} from "./emptyStateConfig.js";

import emptyStateDarkDotsAsset from "./emptyStage.svg";
const EMPTY_STATE_NODE_IDS = {
  light: {
    S: {
      base: "2061:24356",
      featured: "2061:24361",
      ctas: "2061:24366",
      full: "2061:24384",
    },
    M: {
      full: "2061:24346",
    },
  },
  dark: {
    S: {
      base: "2056:23855",
      featured: "2056:23860",
      ctas: "2056:23865",
      full: "2056:23874",
    },
    M: {
      full: "2056:23846",
    },
  },
};

function DecorativeDots({
  isMedium,
  isDarkMode,
  useDarkCtasAsset = false,
  isFeatured = false,
}) {
  const featuredStyle = isMedium
    ? {
        left: "50%",
        transform: "translateX(-50%)",
        top: "-58px",
      }
    : {
        left: "50%",
        transform: "translateX(-50%)",
        top: "-63px",
      };

  if (isDarkMode) {
    return (
      <div
        className={clsx(
          "pointer-events-none absolute z-0",
          !isFeatured && "left-1/2 -translate-x-1/2 -translate-y-1/2",
          isMedium ? "size-[220px]" : "size-[200px]",
        )}
        aria-hidden="true"
        style={isFeatured ? featuredStyle : { top: isMedium ? "42px" : "37px" }}
      >
        <img
          src={emptyStateDarkDotsAsset}
          alt=""
          className="block size-full max-w-none object-contain"
        />
      </div>
    );
  }

  const dotColor = "rgba(232,232,232,0.92)";
  const fadeMask =
    "radial-gradient(circle at center, rgba(0,0,0,0.95) 14%, rgba(0,0,0,0.62) 48%, rgba(0,0,0,0.18) 66%, transparent 84%)";

  return (
    <div
      className={clsx(
        "pointer-events-none absolute z-0",
        !isFeatured && "left-1/2 -translate-x-1/2 -translate-y-1/2",
        isMedium ? "size-[220px]" : "size-[200px]",
      )}
      aria-hidden="true"
      style={isFeatured ? featuredStyle : { top: isMedium ? "42px" : "37px" }}
    >
      <div
        className="size-full"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundPosition: "center",
          backgroundSize: "6px 6px",
          maskImage: fadeMask,
          WebkitMaskImage: fadeMask,
        }}
      />
    </div>
  );
}

function getDocumentDarkMode() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.classList.contains("dark");
}

function ImageIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className={clsx(size === 24 ? "size-6" : "size-5")}
    >
      <path
        d="M18.0664 14.133L15.4581 8.04137C14.5748 5.9747 12.9498 5.89137 11.8581 7.85803L10.2831 10.6997C9.48311 12.1414 7.99144 12.2664 6.95811 10.9747L6.77478 10.7414C5.69978 9.39137 4.18311 9.55803 3.40811 11.0997L1.97478 13.9747C0.966442 15.9747 2.42478 18.333 4.65811 18.333H15.2914C17.4581 18.333 18.9164 16.1247 18.0664 14.133Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.80811 6.66602C7.18882 6.66602 8.30811 5.54673 8.30811 4.16602C8.30811 2.7853 7.18882 1.66602 5.80811 1.66602C4.42739 1.66602 3.30811 2.7853 3.30811 4.16602C3.30811 5.54673 4.42739 6.66602 5.80811 6.66602Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveNodeId(themeKey, size, showFeaturedIcon, showActions) {
  const themeMap = EMPTY_STATE_NODE_IDS[themeKey] ?? EMPTY_STATE_NODE_IDS.light;
  const sizeMap = themeMap[size] ?? themeMap.S;

  if (size === "M") {
    return sizeMap.full;
  }

  if (!showFeaturedIcon && !showActions) {
    return sizeMap.base;
  }

  if (showFeaturedIcon && !showActions) {
    return sizeMap.featured;
  }

  if (!showFeaturedIcon && showActions) {
    return sizeMap.ctas;
  }

  return sizeMap.full;
}

function EmptyState({
  className,
  title = EMPTY_STATE_DEFAULT_PROPS.title,
  description = EMPTY_STATE_DEFAULT_PROPS.description,
  primaryActionLabel = EMPTY_STATE_DEFAULT_PROPS.primaryActionLabel,
  secondaryActionLabel = EMPTY_STATE_DEFAULT_PROPS.secondaryActionLabel,
  size = EMPTY_STATE_DEFAULT_PROPS.size,
  showFeaturedIcon = EMPTY_STATE_DEFAULT_PROPS.showFeaturedIcon,
  showActions = EMPTY_STATE_DEFAULT_PROPS.showActions,
  "aria-label": ariaLabel = EMPTY_STATE_DEFAULT_PROPS["aria-label"],
  ...props
}) {
  const [isDarkMode, setIsDarkMode] = useState(getDocumentDarkMode);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDarkMode(getDocumentDarkMode());
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const resolvedSize = EMPTY_STATE_SIZES.includes(size) ? size : "S";
  const isMedium = resolvedSize === "M";
  const hasVisual = showFeaturedIcon || showActions;
  const themeKey = isDarkMode ? "dark" : "light";
  const nodeId = resolveNodeId(
    themeKey,
    resolvedSize,
    Boolean(showFeaturedIcon),
    Boolean(showActions),
  );

  const titleColorClass = isDarkMode
    ? "text-[var(--color-text-200,#6C6C6C)]"
    : "text-[var(--color-text-200,#4e4e4e)]";
  const descriptionColorClass = isDarkMode
    ? "text-[var(--color-text-100,#484848)]"
    : "text-[var(--color-text-100,#818181)]";
  const iconBorderClass = isDarkMode
    ? "border-[var(--color-neutral-300)]"
    : "border-[var(--color-neutral-200,#e8e8e8)]";
  const iconSurfaceClass = isDarkMode
    ? "bg-[var(--color-neutral-100)] text-[var(--color-neutral-200)]"
    : "bg-[var(--color-neutral-100,#fff)] text-[var(--color-text-100,#818181)]";
  const isDarkCtasVariant =
    isDarkMode && showActions && !showFeaturedIcon && !isMedium;
  const secondaryButtonClass = isDarkCtasVariant
    ? "border-[var(--color-neutral-300,#d2d2d2)] bg-transparent text-[var(--color-text-200,#4e4e4e)] hover:border-[var(--color-neutral-300,#d2d2d2)] hover:bg-transparent hover:text-[var(--color-text-200,#4e4e4e)] focus:border-[var(--color-neutral-300,#d2d2d2)] focus:bg-transparent focus:text-[var(--color-text-200,#4e4e4e)]"
    : undefined;
  const primaryButtonClass = isDarkCtasVariant
    ? "border border-transparent bg-[var(--color-primary-300,#2a2929)] text-[var(--color-neutral-100-uniform,#fff)] hover:border-transparent hover:bg-[var(--color-primary-300,#2a2929)] hover:text-[var(--color-neutral-100-uniform,#fff)] focus:border-transparent focus:bg-[var(--color-primary-300,#2a2929)] focus:text-[var(--color-neutral-100-uniform,#fff)]"
    : undefined;

  return (
    <section
      className={clsx(
        "relative flex w-full flex-col items-center justify-center overflow-hidden",
        isMedium
          ? "min-h-[254px] gap-[32px] px-[24px] py-[24px]"
          : "h-[206px] gap-[24px] px-[16px] py-[16px]",
        className,
      )}
      aria-label={ariaLabel}
      data-node-id={nodeId}
      {...props}
    >
      {hasVisual ? (
        <DecorativeDots
          isMedium={isMedium}
          isDarkMode={isDarkMode}
          useDarkCtasAsset={isDarkCtasVariant}
          isFeatured={showFeaturedIcon}
        />
      ) : null}

      {showFeaturedIcon ? (
        <div
          className={clsx(
            "relative z-[1] shrink-0 rounded-[8px] border shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)]",
            iconBorderClass,
          )}
        >
          <div
            className={clsx(
              "flex items-center justify-center rounded-[8px]",
              iconSurfaceClass,
              isMedium ? "size-[48px] p-[8px]" : "size-[40px] p-[8px]",
            )}
          >
            <ImageIcon size={isMedium ? 24 : 20} />
          </div>
        </div>
      ) : null}

      <div
        className={clsx(
          "relative z-[1] flex w-full flex-col items-center",
          isMedium ? "gap-[16px]" : "gap-[12px]",
        )}
      >
        <div
          className={clsx(
            "flex flex-col items-center gap-[4px] text-center tracking-[-0.5px]",
            isMedium ? "max-w-[280px]" : "w-[261px] max-w-full",
          )}
        >
          <h3
            className={clsx(
              "font-bold",
              titleColorClass,
              isMedium
                ? "text-[18px] leading-[22px]"
                : "text-[16px] leading-[19px]",
            )}
          >
            {title}
          </h3>

          <p
            className={clsx(
              "text-[14px] leading-[17px] font-normal tracking-[-0.5px]",
              descriptionColorClass,
            )}
          >
            {description}
          </p>
        </div>

        {showActions ? (
          <div className="flex flex-wrap items-center justify-center gap-[16px] pt-[2px]">
            <Button
              theme="Primary"
              type="Outline"
              size="S"
              fitContent
              className={secondaryButtonClass}
              showLeftIcon={false}
              showRightIcon={false}
            >
              {secondaryActionLabel}
            </Button>

            <Button
              theme="Primary"
              type="Solid"
              size="S"
              fitContent
              className={primaryButtonClass}
              showLeftIcon={false}
              showRightIcon={false}
            >
              {primaryActionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default EmptyState;
