import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Button from "./Button/Button.jsx";
import Checkbox from "./Checkbox.jsx";
import DropdownMenu from "./DropdownMenu/DropdownMenu.jsx";
import Input from "./Input/Input.jsx";
import Label from "./Label/Label.jsx";
import Modal from "./Modal/Modal.jsx";
import ScrollBar from "./ScrollBar/ScrollBar.jsx";
import TextArea from "./TextArea/TextArea.jsx";

const PROJECT_TYPE_OPTIONS = [
  { id: "residencial", label: "Residencial", type: "Checkbox", checked: "Yes" },
  { id: "comercial", label: "Comercial", type: "Checkbox", checked: "No" },
  { id: "corporativo", label: "Corporativo", type: "Checkbox", checked: "No" },
  { id: "stands", label: "Stands y exhibiciones", type: "Checkbox", checked: "No" },
];

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

function EditIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.05 3.00012L4.49169 9.94179C4.24169 10.2085 4.00002 10.7335 3.95002 11.1001L3.64169 13.7418C3.53335 14.6918 4.21669 15.3418 5.15835 15.1751L7.78335 14.7251C8.15002 14.6585 8.66669 14.3918 8.92502 14.1085L15.4834 7.16679C16.6167 5.96679 17.125 4.60012 15.3584 2.93346C13.6 1.28346 12.2667 1.86679 11.05 3.00012Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.95825 4.15845C10.2999 6.35012 12.0749 8.01679 14.2833 8.23345"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.33325 18.3334H16.6666"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.0001 11.1917C11.4375 11.1917 12.6026 10.0266 12.6026 8.58924C12.6026 7.15188 11.4375 5.98676 10.0001 5.98676C8.56275 5.98676 7.39764 7.15188 7.39764 8.58924C7.39764 10.0266 8.56275 11.1917 10.0001 11.1917Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.01672 7.07508C4.65839 -0.141585 15.3501 -0.133252 16.9834 7.08342C17.9417 11.3168 15.3084 14.9001 13.0001 17.1168C11.3251 18.7334 8.67506 18.7334 6.99172 17.1168C4.69172 14.9001 2.05839 11.3084 3.01672 7.07508Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ProjectRequestModal({
  open,
  onClose,
  onPrevious,
  onNext,
}) {
  const MODAL_BODY_MAX_HEIGHT = 520;
  const DEFAULT_PROJECT_TYPE_ID = PROJECT_TYPE_OPTIONS[0].id;
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [description, setDescription] = useState("");
  const [hasBlueprints, setHasBlueprints] = useState("No");
  const [isProjectTypeMenuOpen, setIsProjectTypeMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollLength, setScrollLength] = useState(1);
  const [selectedProjectTypeId, setSelectedProjectTypeId] = useState(
    DEFAULT_PROJECT_TYPE_ID,
  );
  const contentRef = useRef(null);

  const projectTypeItems = useMemo(
    () =>
      PROJECT_TYPE_OPTIONS.map((option) => ({
        ...option,
        checked: option.id === selectedProjectTypeId ? "Yes" : "No",
      })),
    [selectedProjectTypeId],
  );

  const selectedProjectType = useMemo(
    () => projectTypeItems.find((option) => option.id === selectedProjectTypeId) ??
      projectTypeItems[0],
    [projectTypeItems, selectedProjectTypeId],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setProjectName("");
    setProjectLocation("");
    setDescription("");
    setHasBlueprints("No");
    setIsProjectTypeMenuOpen(false);
    setSelectedProjectTypeId(DEFAULT_PROJECT_TYPE_ID);
    setScrollPosition(0);
    setScrollLength(1);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [DEFAULT_PROJECT_TYPE_ID, onClose, open]);

  useEffect(() => {
    const container = contentRef.current;

    if (!open || !container) {
      return undefined;
    }

    function syncScrollMetrics() {
      const maxScroll = Math.max(
        container.scrollHeight - container.clientHeight,
        1,
      );
      const nextLength = Math.min(
        container.clientHeight / Math.max(container.scrollHeight, 1),
        1,
      );

      setScrollLength(nextLength);
      setScrollPosition(container.scrollTop / maxScroll);
    }

    syncScrollMetrics();
    window.addEventListener("resize", syncScrollMetrics);

    return () => {
      window.removeEventListener("resize", syncScrollMetrics);
    };
  }, [
    description,
    hasBlueprints,
    isProjectTypeMenuOpen,
    onClose,
    open,
    projectLocation,
    projectName,
    selectedProjectTypeId,
  ]);

  useEffect(() => {
    const container = contentRef.current;

    if (!container) {
      return;
    }

    const maxScroll = Math.max(container.scrollHeight - container.clientHeight, 0);

    container.scrollTo({
      top: maxScroll * scrollPosition,
      behavior: "auto",
    });
  }, [scrollPosition]);

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
              Solicitud de Proyecto
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

          <div className="flex items-start pr-[4px]">
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ maxHeight: `${MODAL_BODY_MAX_HEIGHT}px` }}
              onScroll={(event) => {
                const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
                const maxScroll = Math.max(scrollHeight - clientHeight, 1);

                setScrollPosition(scrollTop / maxScroll);
              }}
            >
            <div className="flex items-start justify-between gap-[24px] p-[16px] max-[560px]:flex-col">
              <div className="w-[150px] shrink-0 pt-[2px] max-[560px]:w-full">
                <p className="text-heading-7 text-[var(--color-text-200)]">
                  Detalles del proyecto
                </p>
              </div>

              <div className="flex w-[320px] max-w-full flex-col gap-[16px]">
                <Input
                  label="Nombre del proyecto"
                  required={false}
                  showLabelInfo={false}
                  showHint={false}
                  size="S"
                  type="Default input"
                  placeholder='Ej. "Apto. Noventa y Uno"'
                  leftIcon={<EditIcon className="size-5" />}
                  rightIcon={null}
                  showLeftIcon
                  showRightIcon={false}
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  className="w-full max-w-none"
                />

                <div className="flex w-full flex-col gap-[8px]">
                  <Label
                    label="Tipo de proyecto"
                    required
                    information={false}
                  />
                  <DropdownMenu
                    type="Text"
                    label={selectedProjectType.label}
                    supportingText=""
                    items={projectTypeItems}
                    selectedItemId={selectedProjectType.id}
                    open={isProjectTypeMenuOpen}
                    onOpenChange={setIsProjectTypeMenuOpen}
                    showDivider={isProjectTypeMenuOpen}
                    onItemSelect={(item) => {
                      setSelectedProjectTypeId(item.id);
                      setIsProjectTypeMenuOpen(false);
                    }}
                    interactive
                    className="w-full"
                    aria-label="Seleccionar tipo de proyecto"
                  />
                </div>

                <Input
                  label="Ubicación del proyecto"
                  required
                  showLabelInfo={false}
                  showHint={false}
                  size="S"
                  type="Default input"
                  placeholder='Ej. "Maracaibo, Estado Zulia."'
                  leftIcon={<LocationIcon className="size-5" />}
                  rightIcon={null}
                  showLeftIcon
                  showRightIcon={false}
                  value={projectLocation}
                  onChange={(event) => setProjectLocation(event.target.value)}
                  className="w-full max-w-none"
                />

                <TextArea
                  label="Description"
                  required={false}
                  showLabelInfo
                  showHint
                  placeholder="Texto de prueba"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  minHeight={130}
                  className="w-full max-w-none"
                />

                <div className="flex w-full items-center justify-between border-t border-[var(--color-neutral-200)] py-[12px]">
                  <Label
                    label="¿Dispone de planos del lugar?"
                    required
                    information={false}
                    className="min-w-0"
                  />
                  <Checkbox
                    size="S"
                    checked={hasBlueprints}
                    interactive
                    onCheckedChange={setHasBlueprints}
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>
            </div>
            {scrollLength < 1 ? (
              <ScrollBar
                height={Math.max(
                  Math.min(contentRef.current?.clientHeight ?? MODAL_BODY_MAX_HEIGHT, MODAL_BODY_MAX_HEIGHT),
                  24,
                )}
                length={scrollLength}
                position={scrollPosition}
                interactive
                onPositionChange={setScrollPosition}
                className="shrink-0"
              />
            ) : null}
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
              onClick={onNext}
            >
              Siguiente
            </Button>
          </footer>
        </section>
      </div>
    </Modal>
  );
}

export default ProjectRequestModal;
