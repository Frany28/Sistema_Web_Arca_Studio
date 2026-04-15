import { useState } from "react";
import clsx from "clsx";
import Avatar from "../Avatar/Avatar.jsx";
import ListItemContent from "./ListItemContent.jsx";

function ListItem({
  className,
  avatarProps,
  showDivider = true,
  state = "Default",
  name = "Jonh Doe",
  action = "Comentó",
  badgeLabel = "Stand Nexar 2026",
  description = "El cliente aprobó esta versión",
  timestamp = "Hace 2 minutos",
  showBadge = true,
  showActions = false,
  primaryActionLabel = "Ver más",
  secondaryActionLabel = "Ignorar",
  onPrimaryAction,
  onSecondaryAction,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);

  const normalizedState =
    state === "Hover" || state === "Read" ? state : "Default";

  const resolvedState =
    normalizedState === "Read"
      ? "Read"
      : normalizedState === "Hover"
        ? "Hover"
        : isHovered
          ? "Hover"
          : "Default";

  return (
    <article
      className={clsx(
        "flex w-full items-start gap-[12px] px-[24px] py-[20px] transition-colors duration-150",
        resolvedState === "Default" &&
          "bg-[var(--color-neutral-100)] border-b border-[var(--color-neutral-200)]",
        resolvedState === "Hover" &&
          "bg-[var(--color-neutral-10)] border-b border-[var(--color-neutral-300)] dark:bg-[rgba(42,41,41,0.10)] dark:border-[#4A4A4A]",
        resolvedState === "Read" &&
          "border-b border-[var(--color-neutral-300)] bg-[var(--color-primary-10)] dark:border-[#4A4A4A] dark:bg-[rgba(42,41,41,0.10)]",
        !showDivider && "border-b-0",
        className,
      )}
      onMouseEnter={() => {
        if (normalizedState === "Default") setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (normalizedState === "Default") setIsHovered(false);
      }}
      {...props}
    >
      <Avatar
        size="M"
        style="Icon"
        theme="Brand 1"
        decorative
        {...avatarProps}
      />

      <ListItemContent
        name={name}
        action={action}
        badgeLabel={badgeLabel}
        description={description}
        timestamp={timestamp}
        showBadge={showBadge}
        showActions={showActions}
        primaryActionLabel={primaryActionLabel}
        secondaryActionLabel={secondaryActionLabel}
        onPrimaryAction={onPrimaryAction}
        onSecondaryAction={onSecondaryAction}
      />
    </article>
  );
}

export default ListItem;
