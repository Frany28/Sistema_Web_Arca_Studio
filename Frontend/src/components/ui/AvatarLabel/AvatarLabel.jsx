import clsx from "clsx";
import Avatar from "../Avatar/Avatar.jsx";
import {
  AVATAR_LABEL_DEFAULT_PROPS,
  AVATAR_LABEL_SIZE_STYLES,
} from "./avatarLabelConfig.js";

function AvatarLabel({
  className,
  size = AVATAR_LABEL_DEFAULT_PROPS.size,
  label = AVATAR_LABEL_DEFAULT_PROPS.label,
  subtitle = AVATAR_LABEL_DEFAULT_PROPS.subtitle,
  showLabel = AVATAR_LABEL_DEFAULT_PROPS.showLabel,
  showSubtitle = AVATAR_LABEL_DEFAULT_PROPS.showSubtitle,
  avatarTheme = AVATAR_LABEL_DEFAULT_PROPS.avatarTheme,
  avatarContent = AVATAR_LABEL_DEFAULT_PROPS.avatarContent,
  avatarInitials = AVATAR_LABEL_DEFAULT_PROPS.avatarInitials,
  avatarName = AVATAR_LABEL_DEFAULT_PROPS.avatarName,
  avatarSrc = null,
  avatarAlt = "",
  avatarDecorative = AVATAR_LABEL_DEFAULT_PROPS.avatarDecorative,
  avatarClassName,
  textClassName,
  subtitleClassName,
  ...props
}) {
  const resolvedSize = AVATAR_LABEL_SIZE_STYLES[size]
    ? size
    : AVATAR_LABEL_DEFAULT_PROPS.size;
  const styles = AVATAR_LABEL_SIZE_STYLES[resolvedSize];
  const hasText = showLabel || showSubtitle;

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center",
        hasText && styles.container,
        className,
      )}
      {...props}
    >
      <Avatar
        size={styles.avatarSize}
        theme={avatarTheme}
        content={avatarContent}
        initials={avatarInitials}
        name={avatarName || label}
        src={avatarSrc}
        alt={avatarAlt}
        decorative={avatarDecorative}
        className={clsx(
          "border-0 border-transparent outline-none ring-0 shadow-none",
          avatarClassName,
        )}
      />

      {hasText ? (
        <span
          className={clsx(
            "flex min-w-0 shrink-0 flex-col items-start",
            styles.textGroup,
          )}
        >
          {showLabel ? (
            <span
              className={clsx(
                "max-w-full whitespace-nowrap tracking-[-0.5px] text-[var(--color-text-300)]",
                styles.label,
                textClassName,
              )}
            >
              {label}
            </span>
          ) : null}

          {showSubtitle ? (
            <span
              className={clsx(
                "max-w-full whitespace-nowrap tracking-[-0.5px] text-[var(--color-text-200)]",
                styles.subtitle,
                subtitleClassName,
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

export default AvatarLabel;
