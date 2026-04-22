import { useEffect } from "react";
import clsx from "clsx";
import Button from "../Button/Button.jsx";
import Modal from "../Modal/Modal.jsx";

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

function ProjectRequestModalShell({
  open,
  title = "Solicitud de Proyecto",
  sectionTitle,
  onClose,
  onPrevious,
  onNext,
  nextLabel = "Siguiente",
  nextDisabled = false,
  children,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <Modal
      visible={open}
      showDialog={false}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="project-request-modal-title"
    >
      <div className="flex size-full items-center justify-center px-[16px] py-[24px]">
        <section
          className={clsx(
            "relative flex w-full max-w-[541px] flex-col overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.1)]",
            "max-h-[calc(100dvh-48px)]",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="border-b border-[var(--color-neutral-200)] px-[16px] py-[16px]">
            <h2
              id="project-request-modal-title"
              className="pr-[40px] text-heading-4 text-[var(--color-text-300)]"
            >
              {title}
            </h2>
          </header>

          <button
            type="button"
            className="absolute right-0 top-0 inline-flex size-9 items-center justify-center rounded-[var(--radius-2)] text-[var(--color-text-100)] transition-colors duration-150 hover:bg-[var(--color-neutral-200)]/40 hover:text-[var(--color-text-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-100)]"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            <CloseIcon className="size-3" />
          </button>

          <div className="flex items-start justify-between gap-[24px] p-[16px] max-[560px]:flex-col">
            <div className="w-[150px] shrink-0 pt-[2px] max-[560px]:w-full">
              <p className="text-heading-7 text-[var(--color-text-200)]">
                {sectionTitle}
              </p>
            </div>

            <div className="w-[320px] max-w-full">
              {children}
            </div>
          </div>

          <footer className="flex items-center gap-[16px] border-t border-[var(--color-neutral-200)] p-[16px]">
            <Button
              theme="Primary"
              type="Outline"
              size="M"
              showLeftIcon={false}
              showRightIcon={false}
              className="min-w-0 flex-1"
              onClick={onPrevious}
            >
              Anterior
            </Button>
            <Button
              theme="Primary"
              type="Solid"
              size="M"
              showLeftIcon={false}
              showRightIcon={false}
              className="min-w-0 flex-1"
              disabled={nextDisabled}
              onClick={onNext}
            >
              {nextLabel}
            </Button>
          </footer>
        </section>
      </div>
    </Modal>
  );
}

export default ProjectRequestModalShell;
