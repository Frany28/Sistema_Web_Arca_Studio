import { useState } from "react";
import clsx from "clsx";
import Avatar from "../Avatar/Avatar.jsx";
import Button from "../Button/Button.jsx";
import IconContainer from "../IconContainer/IconContainer.jsx";
import {
  NOTIFICATION_DEFAULT_PROPS,
  NOTIFICATION_LEADING_TYPES,
} from "./notificationConfig.js";

const NOTIFICATION_NODE_IDS = {
  root: "2040:16017",
  content: "2040:16018",
  leadingIcon: "2040:16019",
  textContent: "2040:16020",
  textBlock: "2040:16021",
  titleRow: "2040:16022",
  timestamp: "2040:16023",
  description: "2040:16024",
  actions: "2040:16025",
  secondaryAction: "2040:16026",
  primaryAction: "2040:16027",
  closeAction: "2040:16028",
  avatarVariant: "2061:24914",
};

function CloseIcon({ className }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 2L10 10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M10 2L2 10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getResolvedLeadingType(leadingType) {
  return NOTIFICATION_LEADING_TYPES.includes(leadingType)
    ? leadingType
    : NOTIFICATION_DEFAULT_PROPS.leadingType;
}

function Notification({
  className,
  title = NOTIFICATION_DEFAULT_PROPS.title,
  timestamp = NOTIFICATION_DEFAULT_PROPS.timestamp,
  description = NOTIFICATION_DEFAULT_PROPS.description,
  leadingType = NOTIFICATION_DEFAULT_PROPS.leadingType,
  leading = null,
  showCloseButton = NOTIFICATION_DEFAULT_PROPS.showCloseButton,
  showActions = NOTIFICATION_DEFAULT_PROPS.showActions,
  secondaryActionLabel = NOTIFICATION_DEFAULT_PROPS.secondaryActionLabel,
  primaryActionLabel = NOTIFICATION_DEFAULT_PROPS.primaryActionLabel,
  visible = NOTIFICATION_DEFAULT_PROPS.visible,
  defaultVisible = NOTIFICATION_DEFAULT_PROPS.defaultVisible,
  onDismiss,
  onPrimaryAction,
  onSecondaryAction,
  "aria-label": ariaLabel = NOTIFICATION_DEFAULT_PROPS["aria-label"],
  ...props
}) {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isVisibleControlled = typeof visible === "boolean";
  const isVisible = isVisibleControlled ? visible : internalVisible;
  const resolvedLeadingType = getResolvedLeadingType(leadingType);

  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    if (!isVisibleControlled) {
      setInternalVisible(false);
    }

    onDismiss?.();
  };

  const resolvedLeading =
    leading ??
    (resolvedLeadingType === "Avatar" ? (
      <Avatar
        size="M"
        theme="Brand 1"
        content="Icon"
        decorative
        data-node-id={NOTIFICATION_NODE_IDS.avatarVariant}
      />
    ) : (
      <IconContainer
        size="M"
        type="Outline"
        decorative
        data-node-id={NOTIFICATION_NODE_IDS.leadingIcon}
      />
    ));

  return (
    <article
      className={clsx(
        "relative flex w-full max-w-[347px] gap-[16px] rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px] shadow-[var(--shadow-e2)] transition-colors duration-200",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      data-node-id={NOTIFICATION_NODE_IDS.root}
      {...props}
    >
      <div
        className={clsx(
          "flex min-w-0 flex-1 gap-[16px]",
          showCloseButton && "pr-[28px]",
        )}
        data-node-id={NOTIFICATION_NODE_IDS.content}
      >
        <div className="shrink-0">{resolvedLeading}</div>

        <div
          className="flex min-w-0 flex-1 flex-col gap-[16px]"
          data-node-id={NOTIFICATION_NODE_IDS.textContent}
        >
          <div
            className="flex w-full flex-col gap-[4px]"
            data-node-id={NOTIFICATION_NODE_IDS.textBlock}
          >
            <div
              className="flex w-full items-end gap-[4px]"
              data-node-id={NOTIFICATION_NODE_IDS.titleRow}
            >
              <p className="text-heading-8 text-[var(--color-text-300)]">
                {title}
              </p>

              <p
                className="min-w-0 flex-1 text-body-5 text-[var(--color-text-100)]"
                data-node-id={NOTIFICATION_NODE_IDS.timestamp}
              >
                {timestamp}
              </p>
            </div>

            <p
              className="text-body-3 text-[var(--color-text-200)]"
              data-node-id={NOTIFICATION_NODE_IDS.description}
            >
              {description}
            </p>
          </div>

          {showActions ? (
            <div
              className="flex flex-wrap items-center gap-[8px]"
              data-node-id={NOTIFICATION_NODE_IDS.actions}
            >
              <Button
                theme="Primary"
                type="Ghost"
                size="S"
                fitContent
                showLeftIcon={false}
                showRightIcon={false}
                onClick={onSecondaryAction}
                data-node-id={NOTIFICATION_NODE_IDS.secondaryAction}
              >
                {secondaryActionLabel}
              </Button>

              <Button
                theme="Primary"
                type="Outline"
                size="S"
                fitContent
                showLeftIcon={false}
                showRightIcon={false}
                onClick={onPrimaryAction}
                data-node-id={NOTIFICATION_NODE_IDS.primaryAction}
              >
                {primaryActionLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {showCloseButton ? (
        <Button
          theme="Primary"
          type="Ghost"
          size="S"
          showText={false}
          showLeftIcon
          showRightIcon={false}
          iconLeft={<CloseIcon className="size-3" />}
          className="absolute right-0 top-0"
          aria-label="Cerrar notificación"
          onClick={handleDismiss}
          data-node-id={NOTIFICATION_NODE_IDS.closeAction}
        />
      ) : null}
    </article>
  );
}

export default Notification;
