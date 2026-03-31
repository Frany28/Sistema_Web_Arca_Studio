import { useState } from "react";
import clsx from "clsx";
import {
  BUTTON_INTERACTIVE_STYLES,
  BUTTON_SIZE_STYLES,
  BUTTON_VISUALS,
} from "./buttonConfig.js";

function BlockIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("size-5 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M10 18.3337C14.6024 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6024 1.66699 10 1.66699C5.39762 1.66699 1.66666 5.39795 1.66666 10.0003C1.66666 14.6027 5.39762 18.3337 10 18.3337Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.10834 15.892L15.8917 4.10864"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Button({
  className,
  children = "Button",
  iconLeft = null,
  iconRight = null,
  showLeftIcon = true,
  showRightIcon = true,
  showText = true,
  size = "S",
  state = "Default",
  theme = "Primary",
  type = "Solid",
  htmlType = "button",
  disabled = false,
  onFocus,
  onBlur,
  style,
  ...props
}) {
  const [isInteractiveFocused, setIsInteractiveFocused] = useState(false);
  const resolvedTheme = BUTTON_VISUALS[theme] ? theme : "Primary";
  const resolvedType = BUTTON_VISUALS[resolvedTheme]?.[type] ? type : "Solid";
  const resolvedSize = BUTTON_SIZE_STYLES[size] ? size : "S";
  const resolvedState = disabled ? "Disabled" : state;
  const visual = BUTTON_VISUALS[resolvedTheme][resolvedType];
  const isLink = resolvedType === "Link";
  const iconOnly = !showText;
  const isDisabled = resolvedState === "Disabled";
  const interactiveClassName =
    BUTTON_INTERACTIVE_STYLES[resolvedTheme]?.[resolvedType];
  const showFocusRing =
    !isLink &&
    !isDisabled &&
    (resolvedState === "Focused" ||
      (resolvedState === "Default" && isInteractiveFocused));
  const focusStyle = showFocusRing
    ? {
        outline: `var(--stroke-2) solid ${visual.FocusedOuter}`,
        outlineOffset: "0px",
      }
    : undefined;

  const buttonClassName = clsx(
    "flex items-center justify-center overflow-visible rounded-[var(--radius-2)] font-medium tracking-[-0.5px]",
    isDisabled ? "cursor-not-allowed" : "cursor-pointer",
    iconOnly
      ? BUTTON_SIZE_STYLES[resolvedSize].iconOnly
      : isLink
        ? BUTTON_SIZE_STYLES[resolvedSize].link
        : BUTTON_SIZE_STYLES[resolvedSize].default,
    resolvedState === "Default" && visual.Default,
    resolvedState === "Hover" && visual.Hover,
    resolvedState === "Disabled" && visual.Disabled,
    resolvedState === "Focused" && visual.FocusedInner,
    resolvedState === "Default" && !disabled && interactiveClassName,
    className,
  );

  return (
    <button
      type={htmlType}
      className={buttonClassName}
      disabled={isDisabled}
      style={{
        ...style,
        ...focusStyle,
      }}
      onFocus={(event) => {
        setIsInteractiveFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsInteractiveFocused(false);
        onBlur?.(event);
      }}
      {...props}
    >
      {showLeftIcon ? (
        <span
          className="inline-flex shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          {iconLeft ?? <BlockIcon />}
        </span>
      ) : null}
      {showText ? (
        <span
          className={clsx(
            "inline-flex items-center justify-center",
            BUTTON_SIZE_STYLES[resolvedSize].text,
          )}
        >
          {children}
        </span>
      ) : null}
      {showText && showRightIcon ? (
        <span
          className="inline-flex shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          {iconRight ?? <BlockIcon />}
        </span>
      ) : null}
    </button>
  );
}

export default Button;
