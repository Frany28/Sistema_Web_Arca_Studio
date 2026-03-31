import clsx from "clsx";
import Flag from "../../Flag.jsx";
import { TAG_BASE_STYLES, TAG_SIZE_STYLES } from "./tagConfig.js";

function CloseIcon({ className }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M8.5 3.5L3.5 8.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M3.5 3.5L8.5 8.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DotIndicator() {
  return (
    <span className="inline-flex size-4 items-center justify-center" aria-hidden="true">
      <span className="size-2 rounded-full bg-[var(--color-success-200)]" />
    </span>
  );
}

function Avatar({ className, text = "A" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffe0cf_0%,#a86a4e_40%,#5b3b31_100%)] text-[10px] font-medium text-white",
        className,
      )}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

function Checkbox({ className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04)]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

function Tag({
  className,
  label = "Label",
  size = "S",
  type = "Universal tag",
  avatar = true,
  checkbox = false,
  closeIcon = true,
  count = true,
  dotIndicator = false,
  flag = false,
  countValue = "5",
  countryCode = "IN",
  avatarText = "A",
  ...props
}) {
  const resolvedSize = TAG_SIZE_STYLES[size] ? size : "S";
  const sizing = TAG_SIZE_STYLES[resolvedSize];

  if (type !== "Universal tag") {
    return null;
  }

  return (
    <span className={clsx(TAG_BASE_STYLES, "shrink-0", sizing.container, className)} {...props}>
      {checkbox ? <Checkbox className={sizing.checkbox} /> : null}
      {flag ? <Flag countryCode={countryCode} size={resolvedSize === "L" ? "20px" : "16px"} title={countryCode} /> : null}
      {avatar ? <Avatar className={sizing.avatar} text={avatarText} /> : null}
      {dotIndicator ? <DotIndicator /> : null}
      <span className={clsx("inline-flex items-center whitespace-nowrap text-[var(--color-text-300)]", sizing.text)}>
        {label}
      </span>
      {count ? (
        <span className="inline-flex w-4 items-center justify-center rounded-[2px] bg-[var(--color-neutral-100)] px-[2px]">
          <span className={clsx("inline-flex items-center text-[var(--color-text-300)]", sizing.countText)}>
            {countValue}
          </span>
        </span>
      ) : null}
      {closeIcon ? (
        <span className={clsx("inline-flex items-center justify-center text-[var(--color-text-300)]", sizing.icon)} aria-hidden="true">
          <CloseIcon className={sizing.icon} />
        </span>
      ) : null}
    </span>
  );
}

export default Tag;
