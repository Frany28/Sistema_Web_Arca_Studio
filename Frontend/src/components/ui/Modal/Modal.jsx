import clsx from "clsx";
import Button from "../Button/Button.jsx";
import Checkbox from "../Checkbox.jsx";
import IconContainer from "../IconContainer.jsx";
import {
  MODAL_ALIGNMENTS,
  MODAL_DEFAULT_PROPS,
  MODAL_MOUNTS,
} from "./modalConfig.js";

const MODAL_BACKDROP_FILTER = "var(--effect-blur-b1)";
const MODAL_OVERLAY_BACKGROUND =
  "var(--color-primary-10, rgba(42, 41, 41, 0.10))";

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

function Modal({
  className,
  children,
  mount = MODAL_DEFAULT_PROPS.mount,
  visible = MODAL_DEFAULT_PROPS.visible,
  alignment = MODAL_DEFAULT_PROPS.alignment,
  showDialog = MODAL_DEFAULT_PROPS.showDialog,
  title = MODAL_DEFAULT_PROPS.title,
  description = MODAL_DEFAULT_PROPS.description,
  primaryActionLabel = MODAL_DEFAULT_PROPS.primaryActionLabel,
  secondaryActionLabel = MODAL_DEFAULT_PROPS.secondaryActionLabel,
  checkboxLabel = MODAL_DEFAULT_PROPS.checkboxLabel,
  showCloseButton = MODAL_DEFAULT_PROPS.showCloseButton,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
  style,
  ...props
}) {
  if (!visible) {
    return null;
  }

  const resolvedMount = MODAL_MOUNTS.includes(mount)
    ? mount
    : MODAL_DEFAULT_PROPS.mount;
  const resolvedAlignment = MODAL_ALIGNMENTS.includes(alignment)
    ? alignment
    : MODAL_DEFAULT_PROPS.alignment;

  const positionClassName =
    resolvedMount === "contained"
      ? "absolute inset-0 size-full"
      : "fixed inset-0 h-dvh w-screen";
  const shouldRenderDialog = showDialog || Boolean(children);
  const isCenteredAlignment = resolvedAlignment === "Centered";
  const isHorizontalSplit = resolvedAlignment === "Horizontal split";
  const dialogAlignmentClassName = isCenteredAlignment
    ? "items-center text-center"
    : "items-start text-left";
  const dialogShellClassName =
    resolvedMount === "contained"
      ? "flex size-full flex-col items-center justify-center"
      : "flex size-full flex-col items-center justify-center pb-[24px]";
  const showDialogCloseButton = showCloseButton && !isHorizontalSplit;
  const contentLayoutClassName = isHorizontalSplit
    ? "flex-row items-start"
    : "flex-col";
  const buttonClassName = isHorizontalSplit
    ? "h-[40px] min-w-0 w-[90px]"
    : "h-[40px] min-w-0 w-auto flex-1";

  return (
    <div
      className={clsx(
        positionClassName,
        "z-50 overflow-hidden",
        className,
      )}
      style={{
        background: MODAL_OVERLAY_BACKGROUND,
        backdropFilter: MODAL_BACKDROP_FILTER,
        WebkitBackdropFilter: MODAL_BACKDROP_FILTER,
        ...style,
      }}
      {...props}
    >
      {shouldRenderDialog ? (
        <div
          className={clsx(
            dialogShellClassName,
          )}
        >
          <div className="flex w-full flex-col items-center px-[16px] py-[24px]">
            {children ?? (
              <div
                className="relative flex w-full max-w-[400px] flex-col overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[var(--shadow-e1)]"
                onClick={(event) => event.stopPropagation()}
              >
                {showDialogCloseButton ? (
                  <button
                    type="button"
                    className="absolute right-0 top-0 inline-flex size-9 items-center justify-center rounded-[var(--radius-2)] text-[var(--color-text-100)] transition-colors duration-150 hover:bg-[var(--color-neutral-200)]/40 hover:text-[var(--color-text-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-100)]"
                    onClick={onClose}
                    aria-label="Cerrar modal"
                  >
                    <CloseIcon className="size-3" />
                  </button>
                ) : null}

                <div
                  className={clsx(
                    "flex w-[400px] max-w-full gap-[16px] px-[16px] pt-[16px] pb-[16px]",
                    contentLayoutClassName,
                    dialogAlignmentClassName,
                  )}
                >
                  <IconContainer size="M" type="Outline" />

                  <div className="flex w-full flex-col gap-[4px] tracking-[-0.5px]">
                    <p className="text-heading-6 text-[var(--color-text-300)]">
                      {title}
                    </p>
                    <p className="text-body-3 text-[var(--color-text-200)]">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center gap-[16px] border-t border-[var(--color-neutral-200)] p-[16px]">
                  {isHorizontalSplit ? (
                    <div className="flex h-[17px] w-[168px] items-center gap-[12px]">
                      <Checkbox
                        checked="No"
                        size="S"
                        interactive={false}
                      />
                      <span className="text-body-3 text-[var(--color-text-300)]">
                        {checkboxLabel}
                      </span>
                    </div>
                  ) : null}

                  <Button
                    theme="Primary"
                    type="Outline"
                    size="S"
                    showLeftIcon={false}
                    showRightIcon={false}
                    className={buttonClassName}
                    onClick={onSecondaryAction}
                  >
                    {secondaryActionLabel}
                  </Button>

                  <Button
                    theme="Primary"
                    type="Solid"
                    size="S"
                    showLeftIcon={false}
                    showRightIcon={false}
                    className={buttonClassName}
                    onClick={onPrimaryAction}
                  >
                    {primaryActionLabel}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default Modal;
