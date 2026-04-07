import { useId } from "react";
import clsx from "clsx";
import {
  AVATAR_DEFAULT_PROPS,
  AVATAR_SIZE_STYLES,
  AVATAR_THEME_STYLES,
} from "./avatarConfig.js";

function AvatarIcon({ className }) {
  const clipPathId = useId();

  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g clipPath={`url(#${clipPathId})`}>
        <path
          d="M28.2745 13.9648C22.7387 13.9648 18.2549 18.4486 18.2549 23.9845C18.2549 29.5203 22.7387 34.0041 28.2745 34.0041C33.8103 34.0041 38.2941 29.5203 38.2941 23.9845C38.2941 18.4486 33.8103 13.9648 28.2745 13.9648ZM28.2745 36.509C21.5864 36.509 8.23529 39.8655 8.23529 46.5286V61.558H48.3137V46.5286C48.3137 39.8655 34.9626 36.509 28.2745 36.509Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={clipPathId}>
          <path
            d="M0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28Z"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

function normalizeInitials(initials) {
  const sanitized = String(initials ?? "")
    .trim()
    .replace(/\s+/g, "")
    .slice(0, 2)
    .toUpperCase();

  return sanitized || "JS";
}

function getInitialsFromName(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function Avatar({
  className,
  size = AVATAR_DEFAULT_PROPS.size,
  theme = AVATAR_DEFAULT_PROPS.theme,
  content = AVATAR_DEFAULT_PROPS.content,
  style,
  initials = AVATAR_DEFAULT_PROPS.initials,
  name = AVATAR_DEFAULT_PROPS.name,
  src = null,
  alt = "",
  decorative = AVATAR_DEFAULT_PROPS.decorative,
  icon = null,
  ...props
}) {
  const resolvedSize = AVATAR_SIZE_STYLES[size] ? size : AVATAR_DEFAULT_PROPS.size;
  const resolvedTheme = AVATAR_THEME_STYLES[theme]
    ? theme
    : AVATAR_DEFAULT_PROPS.theme;
  const sizing = AVATAR_SIZE_STYLES[resolvedSize];
  const visual = AVATAR_THEME_STYLES[resolvedTheme];
  const resolvedStyle = style === "Text" || style === "Icon" ? style : null;
  const resolvedContentInput = resolvedStyle ?? content;
  const computedInitials = initials || getInitialsFromName(name);
  const normalizedInitials = normalizeInitials(computedInitials);
  const usesImage = typeof src === "string" && src.trim().length > 0;
  const resolvedContent = usesImage
    ? "Image"
    : resolvedContentInput === "Text"
      ? "Text"
      : "Icon";
  const accessibilityProps = decorative
    ? { "aria-hidden": "true" }
    : { role: "img", "aria-label": alt || name || normalizedInitials };

  return (
    <span
      className={clsx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        sizing.container,
        visual.container,
        className,
      )}
      {...accessibilityProps}
      {...props}
    >
      {resolvedContent === "Image" ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          aria-hidden="true"
        />
      ) : null}

      {resolvedContent === "Icon" ? (
        <span
          className={clsx(
            "inline-flex size-full items-center justify-center",
            visual.content,
          )}
          aria-hidden="true"
        >
          {icon ?? <AvatarIcon className="size-full" />}
        </span>
      ) : null}

      {resolvedContent === "Text" ? (
        <span
          className={clsx(
            "inline-flex items-center justify-center tracking-[-0.5px]",
            sizing.text,
            visual.content,
          )}
        >
          {normalizedInitials}
        </span>
      ) : null}
    </span>
  );
}

export default Avatar;
