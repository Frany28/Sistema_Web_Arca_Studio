import clsx from "clsx";

const SIZE_STYLES = {
  S: {
    default:
      "h-9 w-[115px] gap-[var(--spacing-spacing-gap-3,8px)] px-[var(--spacing-spacing-gap-3,8px)] py-[var(--spacing-spacing-gap-3,8px)]",
    link: "h-9 w-[91px] gap-[4px] px-0 py-0",
    iconOnly: "size-9 p-[var(--spacing-spacing-gap-3,8px)]",
    focusedWrapper: { width: "115px", height: "36px" },
    text: "text-heading-8",
  },
  M: {
    default: "h-11 w-[123px] gap-[8px] px-[12px] py-[12px]",
    link: "h-11 w-[91px] gap-[4px] px-0 py-0",
    iconOnly: "size-11 p-[12px]",
    focusedWrapper: { width: "123px", height: "44px" },
    text: "text-heading-8",
  },
  L: {
    default: "h-[52px] w-[131px] gap-[8px] px-[16px] py-[16px]",
    link: "h-[52px] w-[91px] gap-[4px] px-0 py-0",
    iconOnly: "size-[52px] p-[16px]",
    focusedWrapper: { width: "131px", height: "52px" },
    text: "text-heading-8",
  },
};

const VISUALS = {
  Primary: {
    Solid: {
      Default:
        "border border-transparent bg-[var(--color-primary-300)] text-[var(--color-neutral-100-uniform)]",
      Hover:
        "border border-transparent bg-[var(--color-primary-500)] text-[var(--color-neutral-100-uniform)]",
      FocusedInner:
        "border border-[var(--color-primary-200)] bg-[var(--color-primary-300)] text-[var(--color-neutral-100-uniform)]",
      FocusedOuter: "var(--color-primary-10)",
      Disabled:
        "border border-transparent bg-[var(--color-neutral-300)] text-[var(--color-neutral-100-uniform)]",
    },
    Outline: {
      Default:
        "border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] text-[var(--color-primary-200)]",
      Hover:
        "border border-[var(--color-neutral-600)] bg-[var(--color-neutral-100)] text-[var(--color-primary-200)]",
      FocusedInner:
        "border border-[var(--color-primary-200)] bg-[var(--color-neutral-100)] text-[var(--color-primary-200)]",
      FocusedOuter: "var(--color-primary-10)",
      Disabled:
        "border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]",
    },
    Ghost: {
      Default:
        "border border-transparent bg-transparent text-[var(--color-primary-200)]",
      Hover:
        "border border-transparent bg-[var(--color-primary-10)] text-[var(--color-primary-200)]",
      FocusedInner:
        "border border-[var(--color-neutral-300)] bg-transparent text-[var(--color-primary-200)]",
      FocusedOuter: "var(--color-primary-10)",
      Disabled:
        "border border-transparent bg-transparent text-[var(--color-neutral-500)]",
    },
    Link: {
      Default:
        "border border-transparent bg-transparent text-[var(--color-primary-300)] underline decoration-current underline-offset-2",
      Hover:
        "border border-transparent bg-transparent text-[var(--color-primary-500)] underline decoration-current underline-offset-2",
      FocusedInner:
        "border border-transparent bg-transparent text-[var(--color-primary-500)] underline decoration-current underline-offset-2",
      FocusedOuter: "transparent",
      Disabled:
        "border border-transparent bg-transparent text-[var(--color-neutral-500)] underline decoration-current underline-offset-2",
    },
  },
  Danger: {
    Solid: {
      Default:
        "border border-[var(--color-danger-100)] bg-[var(--color-danger-100)] text-[var(--color-neutral-100-uniform)]",
      Hover:
        "border border-[var(--color-danger-200)] bg-[var(--color-danger-200)] text-[var(--color-neutral-100-uniform)]",
      FocusedInner:
        "border border-[var(--color-danger-200)] bg-[var(--color-danger-100)] text-[var(--color-neutral-100-uniform)]",
      FocusedOuter: "var(--color-danger-10)",
      Disabled:
        "border border-[var(--color-neutral-300)] bg-[var(--color-neutral-300)] text-[var(--color-neutral-100-uniform)]",
    },
    Outline: {
      Default:
        "border border-[var(--color-danger-100)] bg-[var(--color-neutral-100)] text-[var(--color-danger-100)]",
      Hover:
        "border border-[var(--color-danger-200)] bg-[var(--color-neutral-100)] text-[var(--color-danger-200)]",
      FocusedInner:
        "border border-[var(--color-danger-200)] bg-[var(--color-neutral-100)] text-[var(--color-danger-100)]",
      FocusedOuter: "var(--color-danger-10)",
      Disabled:
        "border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]",
    },
  },
  Info: {
    Solid: {
      Default:
        "border border-[var(--color-info-100)] bg-[var(--color-info-100)] text-[var(--color-neutral-100-uniform)]",
      Hover:
        "border border-[var(--color-info-200)] bg-[var(--color-info-200)] text-[var(--color-neutral-100-uniform)]",
      FocusedInner:
        "border border-[var(--color-info-200)] bg-[var(--color-info-100)] text-[var(--color-neutral-100-uniform)]",
      FocusedOuter: "var(--color-info-10)",
      Disabled:
        "border border-[var(--color-neutral-300)] bg-[var(--color-neutral-300)] text-[var(--color-neutral-100-uniform)]",
    },
    Outline: {
      Default:
        "border border-[var(--color-info-100)] bg-[var(--color-neutral-100)] text-[var(--color-info-100)]",
      Hover:
        "border border-[var(--color-info-200)] bg-[var(--color-neutral-100)] text-[var(--color-info-100)]",
      FocusedInner:
        "border border-[var(--color-info-200)] bg-[var(--color-neutral-100)] text-[var(--color-info-100)]",
      FocusedOuter: "var(--color-info-10)",
      Disabled:
        "border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]",
    },
  },
};

const INTERACTIVE_STYLES = {
  Primary: {
    Solid:
      "hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)] focus:outline-none focus:border-[var(--color-primary-200)] focus:shadow-[0_0_0_var(--stroke-2)_var(--color-primary-10)]",
    Outline:
      "hover:border-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-primary-200)] focus:outline-none focus:border-[var(--color-primary-200)] focus:shadow-[0_0_0_var(--stroke-2)_var(--color-primary-10)]",
    Ghost:
      "hover:bg-[var(--color-primary-10)] hover:text-[var(--color-primary-200)] focus:outline-none focus:border-[var(--color-neutral-300)] focus:shadow-[0_0_0_var(--stroke-2)_var(--color-primary-10)]",
    Link:
      "hover:text-[var(--color-primary-500)] focus:outline-none",
  },
  Danger: {
    Solid:
      "hover:border-[var(--color-danger-200)] hover:bg-[var(--color-danger-200)] focus:outline-none focus:border-[var(--color-danger-200)] focus:shadow-[0_0_0_var(--stroke-2)_var(--color-danger-10)]",
    Outline:
      "hover:border-[var(--color-danger-200)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-danger-200)] focus:outline-none focus:border-[var(--color-danger-200)] focus:shadow-[0_0_0_var(--stroke-2)_var(--color-danger-10)]",
  },
  Info: {
    Solid:
      "hover:border-[var(--color-info-200)] hover:bg-[var(--color-info-200)] focus:outline-none focus:border-[var(--color-info-200)] focus:shadow-[0_0_0_var(--stroke-2)_var(--color-info-10)]",
    Outline:
      "hover:border-[var(--color-info-200)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-info-100)] focus:outline-none focus:border-[var(--color-info-200)] focus:shadow-[0_0_0_var(--stroke-2)_var(--color-info-10)]",
  },
};

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
  ...props
}) {
  const resolvedTheme = VISUALS[theme] ? theme : "Primary";
  const resolvedType = VISUALS[resolvedTheme]?.[type] ? type : "Solid";
  const resolvedSize = SIZE_STYLES[size] ? size : "S";
  const resolvedState = disabled ? "Disabled" : state;
  const visual = VISUALS[resolvedTheme][resolvedType];
  const isLink = resolvedType === "Link";
  const isFocused = resolvedState === "Focused" && !isLink;
  const iconOnly = !showText;
  const isDisabled = resolvedState === "Disabled";
  const interactiveClassName = INTERACTIVE_STYLES[resolvedTheme]?.[resolvedType];

  const buttonClassName = clsx(
    "flex items-center justify-center overflow-visible rounded-[var(--radius-2)] font-medium tracking-[-0.5px]",
    isDisabled ? "cursor-not-allowed" : "cursor-pointer",
    iconOnly
      ? SIZE_STYLES[resolvedSize].iconOnly
      : isLink
        ? SIZE_STYLES[resolvedSize].link
        : SIZE_STYLES[resolvedSize].default,
    resolvedState === "Default" && visual.Default,
    resolvedState === "Hover" && visual.Hover,
    resolvedState === "Disabled" && visual.Disabled,
    resolvedState === "Focused" && visual.FocusedInner,
    resolvedState === "Default" && !disabled && interactiveClassName,
    className,
  );

  return isFocused ? (
    <span
      className="flex items-center justify-center"
      style={{
        ...SIZE_STYLES[resolvedSize].focusedWrapper,
        borderRadius: "var(--radius-2)",
        boxShadow: `0 0 0 var(--stroke-2) ${visual.FocusedOuter}`,
        boxSizing: "border-box",
        overflow: "visible",
      }}
    >
      <button type={htmlType} className={buttonClassName} disabled={isDisabled} {...props}>
        {showLeftIcon ? (
          <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
            {iconLeft ?? <BlockIcon />}
          </span>
        ) : null}
        {showText ? (
          <span className={clsx("inline-flex items-center justify-center", SIZE_STYLES[resolvedSize].text)}>
            {children}
          </span>
        ) : null}
        {showText && showRightIcon ? (
          <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
            {iconRight ?? <BlockIcon />}
          </span>
        ) : null}
      </button>
    </span>
  ) : (
    <button type={htmlType} className={buttonClassName} disabled={isDisabled} {...props}>
      {showLeftIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
          {iconLeft ?? <BlockIcon />}
        </span>
      ) : null}
      {showText ? (
        <span className={clsx("inline-flex items-center justify-center", SIZE_STYLES[resolvedSize].text)}>
          {children}
        </span>
      ) : null}
      {showText && showRightIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
          {iconRight ?? <BlockIcon />}
        </span>
      ) : null}
    </button>
  );
}

export default Button;
