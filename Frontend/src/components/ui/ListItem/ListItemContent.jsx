import clsx from "clsx";
import Badge from "../Badge/Badge.jsx";
import Button from "../Button/Button.jsx";

function ListItemContent({
  className,
  name = "Jonh Doe",
  action = "Comentó",
  badgeLabel = "Stand Nexar 2026",
  description = "El cliente aprobó esta versión",
  timestamp = "Hace 2 minutos",
  showBadge = true,
  showActions = false,
  secondaryActionLabel = "Ignorar",
  primaryActionLabel = "Ver más",
  onPrimaryAction,
  onSecondaryAction,
}) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-1 items-start justify-between gap-[12px]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex min-w-0 items-start justify-between gap-[12px]">
          <p className="w-[210px] text-heading-8 text-[var(--color-text-300)]">
            {name}
          </p>

          <span className="shrink-0 text-body-5 text-[var(--color-text-100)]">
            {timestamp}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-[4px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-body-3 text-[var(--color-text-200)]">
              {action}
            </span>

            <span
              className="inline-block size-[4px] shrink-0 rounded-full bg-[var(--color-text-200)]"
              aria-hidden="true"
            />
          </div>

          {showBadge ? (
            <Badge
              label={badgeLabel}
              theme="Info"
              variation="Simple"
              size="M"
              className=" dark:border-transparent dark:bg-transparent"
            />
          ) : null}
        </div>

        <p className="w-[210px] text-body-3 text-[var(--color-text-100)]">
          {description}
        </p>

        {showActions ? (
          <div className="flex items-center gap-[8px] pt-[4px]">
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
    </div>
  );
}

export default ListItemContent;
