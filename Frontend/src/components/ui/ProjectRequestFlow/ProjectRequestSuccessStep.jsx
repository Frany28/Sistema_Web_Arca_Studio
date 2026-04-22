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

function TickCircleIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.0001 18.3333C14.6025 18.3333 18.3334 14.6024 18.3334 9.99996C18.3334 5.39759 14.6025 1.66663 10.0001 1.66663C5.39771 1.66663 1.66675 5.39759 1.66675 9.99996C1.66675 14.6024 5.39771 18.3333 10.0001 18.3333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.45825 10L8.81659 12.3583L13.5416 7.64166"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectRequestSuccessStep({
  open,
  onClose,
  onAccept,
}) {
  return (
    <Modal
      visible={open}
      showDialog={false}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="project-request-success-title"
    >
      <div className="flex size-full items-center justify-center px-[16px] py-[24px]">
        <section
          className="relative flex w-full max-w-[400px] flex-col items-center overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.1)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex w-full flex-col items-center gap-[16px] px-[16px] pb-[16px] pt-[16px]">
            <div className="rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)]">
              <div className="flex size-[40px] items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-neutral-100)] p-[8px] text-[var(--color-success-200)]">
                <TickCircleIcon className="size-5" />
              </div>
            </div>

            <div className="flex w-full flex-col items-center gap-[4px] text-center tracking-[-0.5px]">
              <h2
                id="project-request-success-title"
                className="text-heading-6 text-[var(--color-text-300)]"
              >
                Hemos recibido tu solicitud
              </h2>
              <p className="text-body-3 text-[var(--color-text-200)]">
                Nuestro equipo revisará la información y pronto se pondrá en
                contacto contigo para continuar el proceso.
              </p>
            </div>

            <button
              type="button"
              className="absolute right-0 top-0 inline-flex size-9 items-center justify-center rounded-[var(--radius-2)] text-[var(--color-text-100)] transition-colors duration-150 hover:bg-[var(--color-neutral-200)]/40 hover:text-[var(--color-text-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-100)]"
              aria-label="Cerrar modal"
              onClick={onClose}
            >
              <CloseIcon className="size-3" />
            </button>
          </div>

          <footer className="flex w-full items-center gap-[16px] border-t border-[var(--color-neutral-200)] p-[16px]">
            <Button
              theme="Primary"
              type="Solid"
              size="M"
              showLeftIcon={false}
              showRightIcon={false}
              className="min-w-0 flex-1"
              onClick={onAccept}
            >
              Aceptar
            </Button>
          </footer>
        </section>
      </div>
    </Modal>
  );
}

export default ProjectRequestSuccessStep;
