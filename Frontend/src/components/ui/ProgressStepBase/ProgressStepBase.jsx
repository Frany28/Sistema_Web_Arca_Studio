import { useEffect, useState } from "react";
import clsx from "clsx";
import * as IconsaxIcons from "iconsax-react";
import {
  PROGRESS_STEP_BASE_DEFAULT_PROPS,
  PROGRESS_STEP_BASE_SIZES,
  PROGRESS_STEP_BASE_STATES,
  PROGRESS_STEP_BASE_TYPES,
} from "./progressStepBaseConfig.js";

const PROGRESS_STEP_BASE_NODE_IDS = {
  light: {
    "Line text": {
      Incomplete: {
        S: "2175:33237",
        M: "2175:33251",
        L: "2175:33265",
      },
      Active: {
        S: "2175:33279",
        M: "2175:33294",
        L: "2175:33309",
      },
      Completed: {
        S: "2175:33324",
        M: "2175:33339",
        L: "2175:33354",
      },
    },
    Numbered: {
      Incomplete: {
        S: "2175:33240",
        M: "2175:33254",
        L: "2175:33268",
      },
      Active: {
        S: "2175:33282",
        M: "2175:33297",
        L: "2175:33312",
      },
      Completed: {
        S: "2175:33327",
        M: "2175:33342",
        L: "2175:33357",
      },
    },
    "Featured Icon": {
      Incomplete: {
        S: "2175:33246",
        M: "2175:33260",
        L: "2175:33274",
      },
      Active: {
        S: "2175:33289",
        M: "2175:33304",
        L: "2175:33319",
      },
      Completed: {
        S: "2175:33334",
        M: "2175:33349",
        L: "2175:33364",
      },
    },
  },
  dark: {
    "Line text": {
      Incomplete: {
        S: "2056:22827",
        M: "2056:22841",
        L: "2056:22855",
      },
      Active: {
        S: "2056:22869",
        M: "2056:22884",
        L: "2056:22899",
      },
      Completed: {
        S: "2056:22914",
        M: "2056:22929",
        L: "2056:22944",
      },
    },
    Numbered: {
      Incomplete: {
        S: "2056:22830",
        M: "2056:22844",
        L: "2056:22858",
      },
      Active: {
        S: "2056:22872",
        M: "2056:22887",
        L: "2056:22902",
      },
      Completed: {
        S: "2056:22917",
        M: "2056:22932",
        L: "2056:22947",
      },
    },
    "Featured Icon": {
      Incomplete: {
        S: "2056:22836",
        M: "2056:22850",
        L: "2056:22864",
      },
      Active: {
        S: "2056:22879",
        M: "2056:22894",
        L: "2056:22909",
      },
      Completed: {
        S: "2056:22924",
        M: "2056:22939",
        L: "2056:22954",
      },
    },
  },
};

const NUMBER_BADGE_SIZES = {
  S: {
    badge: "size-[32px]",
    featuredWidth: "w-[32px]",
    icon: "size-[16px]",
    number: "text-[12px] leading-[12px] tracking-[-0.5px]",
  },
  M: {
    badge: "size-[40px]",
    featuredWidth: "w-[40px]",
    icon: "size-[20px]",
    number: "text-[14px] leading-[14px] tracking-[-0.5px]",
  },
  L: {
    badge: "size-[48px]",
    featuredWidth: "w-[48px]",
    icon: "size-[24px]",
    number: "text-[16px] leading-[16px] tracking-[-0.5px]",
  },
};

const TEXT_SIZES = {
  S: {
    lineGap: "gap-[2px]",
    linePaddingTop: "pt-[12px]",
    title: "text-[14px] leading-[17px] tracking-[-0.5px]",
    subtext: "text-[12px] leading-[14px] tracking-[-0.5px]",
    stackGap: "gap-[4px]",
  },
  M: {
    lineGap: "gap-[2px]",
    linePaddingTop: "pt-[12px]",
    title: "text-[16px] leading-[19px] tracking-[-0.5px]",
    subtext: "text-[14px] leading-[17px] tracking-[-0.5px]",
    stackGap: "gap-[4px]",
  },
  L: {
    lineGap: "gap-[4px]",
    linePaddingTop: "pt-[16px]",
    title: "text-[16px] leading-[19px] tracking-[-0.5px]",
    subtext: "text-[14px] leading-[17px] tracking-[-0.5px]",
    stackGap: "gap-[12px]",
  },
};

function getDocumentDarkMode() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.classList.contains("dark");
}

function getNumberedInactiveShadowClass(isDarkMode) {
  return isDarkMode ? "" : "shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)]";
}

function getNumberedActiveShadowClass(isDarkMode) {
  return isDarkMode
    ? ""
    : "shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04),0_0_0_4px_rgba(42,41,41,0.10)]";
}

function getFeaturedActiveHaloShadowClass(isDarkMode) {
  return isDarkMode
    ? "shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04),0_0_0_4px_rgba(42,41,41,0.10)]"
    : "shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04),0_0_0_4px_rgba(42,41,41,0.10)]";
}

function getStateTextColorClasses(state) {
  return {
    title: clsx(
      state === "Incomplete" && "text-[var(--color-text-100)]",
      state === "Active" && "text-[var(--color-text-300)]",
      state === "Completed" && "text-[var(--color-text-200)]",
    ),
    supporting: clsx(
      state === "Incomplete" && "text-[var(--color-neutral-400)]",
      state === "Active" && "text-[var(--color-text-300)]",
      state === "Completed" && "text-[var(--color-text-100)]",
    ),
  };
}

function getLineBorderClass(state) {
  return state === "Incomplete"
    ? "border-[var(--color-neutral-200)]"
    : "border-[var(--color-text-300)]";
}

function CheckTickIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5.5 10.25L8.375 13.125L14.5 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeaturedImageIcon({ className }) {
  const Image = IconsaxIcons.Image;

  if (Image) {
    return (
      <Image
        size="20"
        variant="Linear"
        color="currentColor"
        className={className}
      />
    );
  }

  return null;
}

function ProgressStepBase({
  className,
  title = PROGRESS_STEP_BASE_DEFAULT_PROPS.title,
  subtext = PROGRESS_STEP_BASE_DEFAULT_PROPS.subtext,
  type = PROGRESS_STEP_BASE_DEFAULT_PROPS.type,
  state = PROGRESS_STEP_BASE_DEFAULT_PROPS.state,
  size = PROGRESS_STEP_BASE_DEFAULT_PROPS.size,
  showSubtext = PROGRESS_STEP_BASE_DEFAULT_PROPS.showSubtext,
  number = PROGRESS_STEP_BASE_DEFAULT_PROPS.number,
  "aria-label": ariaLabel = PROGRESS_STEP_BASE_DEFAULT_PROPS["aria-label"],
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

  const resolvedType = PROGRESS_STEP_BASE_TYPES.includes(type)
    ? type
    : PROGRESS_STEP_BASE_DEFAULT_PROPS.type;
  const resolvedState = PROGRESS_STEP_BASE_STATES.includes(state)
    ? state
    : PROGRESS_STEP_BASE_DEFAULT_PROPS.state;
  const resolvedSize = PROGRESS_STEP_BASE_SIZES.includes(size)
    ? size
    : PROGRESS_STEP_BASE_DEFAULT_PROPS.size;
  const textStyles = TEXT_SIZES[resolvedSize];
  const badgeStyles = NUMBER_BADGE_SIZES[resolvedSize];
  const themeKey = isDarkMode ? "dark" : "light";
  const nodeId =
    PROGRESS_STEP_BASE_NODE_IDS[themeKey][resolvedType][resolvedState][
      resolvedSize
    ];

  const isLineText = resolvedType === "Line text";
  const isNumbered = resolvedType === "Numbered";
  const isFeaturedIcon = resolvedType === "Featured Icon";
  const isActive = resolvedState === "Active";
  const isCompleted = resolvedState === "Completed";
  const stateTextColors = getStateTextColorClasses(resolvedState);

  function renderNumberedBadge() {
    if (isCompleted) {
      return (
        <div
          className={clsx(
            "flex shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-300)] text-[var(--color-neutral-100-uniform)]",
            badgeStyles.badge,
          )}
        >
          <CheckTickIcon className={badgeStyles.icon} />
        </div>
      );
    }

    if (isActive) {
      return (
        <div
          className={clsx(
            "flex shrink-0 items-center justify-center rounded-full border border-[var(--color-text-300)] bg-[var(--color-neutral-100)] text-[var(--color-text-300)]",
            getNumberedActiveShadowClass(isDarkMode),
            badgeStyles.badge,
          )}
        >
          <span
            className={clsx(
              "font-['Inter:Regular',sans-serif] font-normal not-italic",
              badgeStyles.number,
            )}
          >
            {number}
          </span>
        </div>
      );
    }

    return (
      <div
        className={clsx(
          "flex shrink-0 items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-text-100)]",
          getNumberedInactiveShadowClass(isDarkMode),
          badgeStyles.badge,
        )}
      >
        <span
          className={clsx(
            "font-['Inter:Regular',sans-serif] font-normal not-italic",
            badgeStyles.number,
          )}
        >
          {number}
        </span>
      </div>
    );
  }

  function renderFeaturedIconBadge() {
    const sharedIcon = (
      <FeaturedImageIcon
        className={clsx(
          badgeStyles.icon,
          isCompleted
            ? "text-[var(--color-neutral-100-uniform)]"
            : isActive
              ? "text-[var(--color-text-300)]"
              : "text-[var(--color-text-100)]",
        )}
      />
    );

    if (isCompleted) {
      return (
        <div
          className={clsx(
            "rounded-[8px] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)]",
            badgeStyles.featuredWidth,
          )}
        >
          <div
            className={clsx(
              "flex items-center justify-center rounded-[8px] bg-[var(--color-primary-300)]",
              badgeStyles.badge,
            )}
          >
            {sharedIcon}
          </div>
        </div>
      );
    }

    if (isActive) {
      return (
        <div
          className={clsx(
            "relative rounded-[8px]",
            getFeaturedActiveHaloShadowClass(isDarkMode),
            badgeStyles.badge,
          )}
        >
          <div
            className={clsx(
              "box-border flex size-full items-center justify-center rounded-[8px] border border-[var(--color-text-300)] bg-[var(--color-neutral-100)] p-[8px]",
            )}
          >
            {sharedIcon}
          </div>
        </div>
      );
    }

    return (
      <div
        className={clsx(
          "relative box-border rounded-[8px] border border-[var(--color-neutral-200)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)]",
          badgeStyles.badge,
        )}
      >
        <div
          className={clsx(
            "absolute inset-0 box-border flex items-center justify-center rounded-[8px] bg-[var(--color-neutral-100)]",
          )}
        >
          {sharedIcon}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex w-[304px] max-w-full shrink-0",
        isLineText
          ? clsx(
              "flex-col items-start border-t-[4px]",
              textStyles.lineGap,
              textStyles.linePaddingTop,
              getLineBorderClass(resolvedState),
            )
          : clsx("flex-col items-center", textStyles.stackGap),
        className,
      )}
      data-node-id={nodeId}
      aria-label={ariaLabel}
      {...props}
    >
      {isLineText ? (
        <>
          <span
            className={clsx(
              "font-['Inter:Regular',sans-serif] font-normal not-italic",
              textStyles.title,
              stateTextColors.title,
            )}
          >
            {title}
          </span>
          {showSubtext ? (
            <span
              className={clsx(
                "font-['Inter:Regular',sans-serif] font-normal not-italic",
                textStyles.subtext,
                stateTextColors.supporting,
              )}
            >
              {subtext}
            </span>
          ) : null}
        </>
      ) : (
        <>
          {isNumbered ? renderNumberedBadge() : null}
          {isFeaturedIcon ? renderFeaturedIconBadge() : null}

          <div className="flex w-full flex-col items-center gap-[4px] text-center tracking-[-0.5px]">
            <span
              className={clsx(
                "font-['Inter:Regular',sans-serif] font-normal not-italic",
                textStyles.title,
                stateTextColors.title,
              )}
            >
              {title}
            </span>
            {showSubtext ? (
              <span
                className={clsx(
                  "font-['Inter:Regular',sans-serif] font-normal not-italic",
                  textStyles.subtext,
                  stateTextColors.supporting,
                )}
              >
                {subtext}
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export default ProgressStepBase;
