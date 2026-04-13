import { useEffect, useState } from "react";
import clsx from "clsx";
import * as IconsaxIcons from "iconsax-react";
import Button from "../Button/Button.jsx";
import {
  EMPTY_STATE_DEFAULT_PROPS,
  EMPTY_STATE_SIZES,
} from "./emptyStateConfig.js";

const EMPTY_STATE_DARK_CTAS_DOTS_ASSET =
  "https://www.figma.com/api/mcp/asset/3e382045-786b-4e8e-b663-1e27a1316932";

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

function DecorativeDots({ isMedium, isDarkMode, useDarkCtasAsset = false }) {
  if (useDarkCtasAsset) {
    return (
      <div
        className="pointer-events-none absolute z-0"
        aria-hidden="true"
        style={{
          right: "46px",
          top: "-63px",
          width: "200px",
          height: "200px",
        }}
      >
        <img
          src={EMPTY_STATE_DARK_CTAS_DOTS_ASSET}
          alt=""
          className="block size-full max-w-none"
        />
      </div>
    );
  }

  const dotColor = isDarkMode
    ? "rgba(210,210,210,0.34)"
    : "rgba(232,232,232,0.92)";
  const fadeMask = isDarkMode
    ? "radial-gradient(circle at center, rgba(0,0,0,0.9) 18%, rgba(0,0,0,0.6) 52%, rgba(0,0,0,0.18) 70%, transparent 84%)"
    : "radial-gradient(circle at center, rgba(0,0,0,0.95) 14%, rgba(0,0,0,0.62) 48%, rgba(0,0,0,0.18) 66%, transparent 84%)";

  return (
    <div
      className={clsx(
        "pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2",
        isMedium ? "size-[220px]" : "size-[200px]",
      )}
      aria-hidden="true"
      style={{
        top: isMedium ? "42px" : "37px",
      }}
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
  const Image = IconsaxIcons.Image;

  if (!Image) {
    return null;
  }

  return (
    <Image
      size={String(size)}
      variant="Linear"
      color="currentColor"
      className={clsx(size === 24 ? "size-6" : "size-5")}
    />
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
    ? "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"
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
