import { useEffect, useState } from "react";
import clsx from "clsx";
import * as IconsaxIcons from "iconsax-react";
import Button from "../Button/Button.jsx";
import {
  EMPTY_STATE_DEFAULT_PROPS,
  EMPTY_STATE_SIZES,
} from "./emptyStateConfig.js";

import circlesAsset from "../../../assets/circles.svg";

const EMPTY_STATE_NODE_IDS = {
  light: {
    S: {
      base: "2061:24356",
      featured: "2061:24361",
      ctas: "2061:24366",
      full: "2061:24384",
    },
    M: {
      full: "2061:24347",
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

function DecorativeDots({ isMedium, isFeatured = false }) {
  const featuredStyle = {
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  };

  return (
    <div
      className={clsx(
        "pointer-events-none absolute z-0",
        !isFeatured && "left-1/2 -translate-x-1/2 -translate-y-1/2",
        isMedium ? "h-[216px] w-[221px]" : "h-[196px] w-[201px]",
      )}
      aria-hidden="true"
      style={isFeatured ? featuredStyle : { top: isMedium ? "42px" : "37px" }}
    >
      <img
        src={circlesAsset}
        alt=""
        className="block h-full w-full max-w-none object-fill opacity-[0.12] dark:opacity-100"
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
  onPrimaryAction,
  onSecondaryAction,
  size = EMPTY_STATE_DEFAULT_PROPS.size,
  showFeaturedIcon = EMPTY_STATE_DEFAULT_PROPS.showFeaturedIcon,
  showActions = EMPTY_STATE_DEFAULT_PROPS.showActions,
  showSecondaryAction = EMPTY_STATE_DEFAULT_PROPS.showSecondaryAction,
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

  const ImageIcon = IconsaxIcons.Image;

  return (
    <section
      className={clsx(
        "relative flex w-full flex-col items-center justify-center overflow-clip",
        isMedium
          ? "min-h-[254px] gap-[32px] px-[24px] py-[24px]"
          : "h-[206px] gap-[24px] px-[16px] py-[16px]",
        className,
      )}
      aria-label={ariaLabel}
      data-node-id={nodeId}
      {...props}
    >
      {hasVisual && !showFeaturedIcon ? (
        <DecorativeDots isMedium={isMedium} />
      ) : null}

      {showFeaturedIcon ? (
        <div className="relative z-[1] flex shrink-0 items-center justify-center overflow-visible">
          <DecorativeDots
            isMedium={isMedium}
            isFeatured
          />

          <div
            className={clsx(
              "relative z-[1] shrink-0 rounded-[var(--radius-2,8px)] border shadow-[var(--shadow-e1,0px_0px_5px_0px_rgba(0,0,0,0.05))]",
              "border-[var(--color-neutral-200)]",
            )}
          >
            <div
              className={clsx(
                "flex items-center justify-center rounded-[var(--radius-2,8px)]",
                "bg-[var(--color-neutral-100)] text-[var(--color-text-100)]",
                isMedium ? "size-[48px] p-[8px]" : "size-[40px] p-[8px]",
              )}
            >
              <ImageIcon
                size={isMedium ? 24 : 20}
                variant="Linear"
                color="currentColor"
                aria-hidden="true"
              />
            </div>
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
            "flex flex-col items-center gap-[4px] text-center",
            isMedium ? "max-w-[280px]" : "w-[261px] max-w-full",
          )}
        >
          <h3
            className={clsx(
              "text-[var(--color-text-200)]",
              isMedium ? "text-heading-6" : "text-heading-7",
            )}
          >
            {title}
          </h3>

          <p
            className={clsx(
              "text-body-3 text-[var(--color-text-100)]",
            )}
          >
            {description}
          </p>
        </div>

        {showActions ? (
          <div className="flex flex-wrap items-center justify-center gap-[16px] pt-[2px]">
            {showSecondaryAction ? (
              <Button
                theme="Primary"
                type="Outline"
                size="S"
                fitContent
                showLeftIcon={false}
                showRightIcon={false}
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}

            <Button
              theme="Primary"
              type="Solid"
              size="S"
              fitContent
              showLeftIcon={false}
              showRightIcon={false}
              onClick={onPrimaryAction}
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
