import { useState } from "react";
import clsx from "clsx";
import Avatar from "../Avatar/Avatar.jsx";
import Badge from "../Badge/Badge.jsx";
import Button from "../Button/Button.jsx";
import FileAttachmentIcons from "../FileAttachmentIcons/FileAttachmentIcons.jsx";
import {
  LIST_ITEM_DEFAULT_PROPS,
  LIST_ITEM_STATES,
  LIST_ITEM_TYPES,
} from "./listItemConfig.js";

const LIST_ITEM_NODE_IDS = {
  Default: "2144:28570",
  "Upload file": "2144:28572",
};

function getResolvedType(type) {
  return LIST_ITEM_TYPES.includes(type)
    ? type
    : LIST_ITEM_DEFAULT_PROPS.type;
}

function getResolvedState(state, isHovered) {
  if (LIST_ITEM_STATES.includes(state)) {
    return state;
  }

  return isHovered ? "Hover" : "Default";
}

function createKeyboardHandler(onClick) {
  return (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onClick?.(event);
  };
}

function ListItem({
  className,
  type = LIST_ITEM_DEFAULT_PROPS.type,
  state = LIST_ITEM_DEFAULT_PROPS.state,
  interactive = LIST_ITEM_DEFAULT_PROPS.interactive,
  authorName = LIST_ITEM_DEFAULT_PROPS.authorName,
  timestamp = LIST_ITEM_DEFAULT_PROPS.timestamp,
  activityLabel = LIST_ITEM_DEFAULT_PROPS.activityLabel,
  uploadPrefix = LIST_ITEM_DEFAULT_PROPS.uploadPrefix,
  projectLabel = LIST_ITEM_DEFAULT_PROPS.projectLabel,
  comment = LIST_ITEM_DEFAULT_PROPS.comment,
  showMessage = LIST_ITEM_DEFAULT_PROPS.showMessage,
  showComment = LIST_ITEM_DEFAULT_PROPS.showComment,
  showButtons = LIST_ITEM_DEFAULT_PROPS.showButtons,
  primaryActionLabel = LIST_ITEM_DEFAULT_PROPS.primaryActionLabel,
  secondaryActionLabel = LIST_ITEM_DEFAULT_PROPS.secondaryActionLabel,
  fileName = LIST_ITEM_DEFAULT_PROPS.fileName,
  fileSize = LIST_ITEM_DEFAULT_PROPS.fileSize,
  fileType = LIST_ITEM_DEFAULT_PROPS.fileType,
  avatarName = LIST_ITEM_DEFAULT_PROPS.avatarName,
  avatarSrc = LIST_ITEM_DEFAULT_PROPS.avatarSrc,
  avatarInitials = LIST_ITEM_DEFAULT_PROPS.avatarInitials,
  onClick,
  onPrimaryAction,
  onSecondaryAction,
  "aria-label": ariaLabel = LIST_ITEM_DEFAULT_PROPS["aria-label"],
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const resolvedType = getResolvedType(type);
  const resolvedState = getResolvedState(state, isHovered);
  const hasForcedState = LIST_ITEM_STATES.includes(state);
  const isInteractive =
    !hasForcedState &&
    (interactive ||
      typeof onClick === "function" ||
      typeof onPrimaryAction === "function" ||
      typeof onSecondaryAction === "function");
  const isUploadFile = resolvedType === "Upload file";
  const hoverClassName =
    resolvedState === "Hover"
      ? "bg-[var(--color-neutral-bg)]"
      : "bg-[var(--color-neutral-100)]";

  const handlePrimaryAction = (event) => {
    event.stopPropagation();
    onPrimaryAction?.(event);
  };

  const handleSecondaryAction = (event) => {
    event.stopPropagation();
    onSecondaryAction?.(event);
  };

  return (
    <div
      className={clsx(
        "flex w-full items-start gap-[12px] border-b border-[var(--color-neutral-200)] px-[24px] py-[20px] transition-colors duration-150",
        hoverClassName,
        isInteractive &&
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary-10)]",
        className,
      )}
      data-node-id={LIST_ITEM_NODE_IDS[resolvedType]}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onMouseEnter={isInteractive ? () => setIsHovered(true) : undefined}
      onMouseLeave={isInteractive ? () => setIsHovered(false) : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? createKeyboardHandler(onClick) : undefined}
      {...props}
    >
      <Avatar
        size="M"
        theme="Brand 1"
        content="Icon"
        name={avatarName || authorName}
        initials={avatarInitials}
        src={avatarSrc}
        decorative
      />

      <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
        {isUploadFile ? (
          <>
            <div className="flex w-full items-start justify-between gap-[12px]">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[4px]">
                <p className="text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)]">
                  <span className="font-medium text-[var(--color-text-300)]">
                    {authorName}
                  </span>{" "}
                  {uploadPrefix}
                </p>

                <Badge
                  theme="Info"
                  size="S"
                  variation="Simple"
                  label={projectLabel}
                />
              </div>

              <p className="shrink-0 text-body-5 text-[var(--color-text-100)]">
                {timestamp}
              </p>
            </div>

            <div className="flex items-center gap-[8px]">
              <div className="relative h-[24px] w-[21px] shrink-0 overflow-hidden">
                <div className="origin-left-top scale-[0.6]">
                  <FileAttachmentIcons type={fileType} />
                </div>
              </div>

              <p className="text-body-5 text-[var(--color-text-200)]">
                {fileName}
              </p>

              <p className="text-body-5 text-[var(--color-text-100)]">
                {fileSize}
              </p>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col gap-[4px]">
            <div className="flex w-full items-start justify-between gap-[12px]">
              <p className="max-w-[210px] text-heading-8 text-[var(--color-text-300)]">
                {authorName}
              </p>

              <p className="shrink-0 text-body-5 text-[var(--color-text-100)]">
                {timestamp}
              </p>
            </div>

            {(showMessage || projectLabel) && (
              <div className="flex flex-wrap items-center gap-[4px]">
                {showMessage ? (
                  <p className="text-body-3 text-[var(--color-text-200)]">
                    {activityLabel} •
                  </p>
                ) : null}

                <Badge
                  theme="Info"
                  size="S"
                  variation="Simple"
                  label={projectLabel}
                />
              </div>
            )}

            {showComment ? (
              <p className="max-w-[210px] text-body-3 text-[var(--color-text-100)]">
                {comment}
              </p>
            ) : null}
          </div>
        )}

        {showButtons ? (
          <div className="flex flex-wrap items-center gap-[8px]">
            <Button
              theme="Primary"
              type="Outline"
              size="S"
              fitContent
              showLeftIcon={false}
              showRightIcon={false}
              onClick={handleSecondaryAction}
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
              onClick={handlePrimaryAction}
            >
              {primaryActionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ListItem;
