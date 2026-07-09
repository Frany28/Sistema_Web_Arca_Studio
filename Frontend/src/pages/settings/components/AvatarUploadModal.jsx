import { useEffect, useMemo, useState } from "react";
import Modal from "../../../components/ui/Modal/Modal.jsx";
import Button from "../../../components/ui/Button/Button.jsx";
import FileUploadSection from "../../../components/ui/FileUploadSection/FileUploadSection.jsx";

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

function AvatarUploadModal({
  isSubmitting = false,
  open,
  onClose,
  onConfirm,
}) {
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!open) {
      const frameId = window.requestAnimationFrame(() => {
        setSelectedFile(null);
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose, open]);

  const selectedFileLabel = useMemo(() => {
    if (!selectedFile) {
      return "Formatos JPEG, PNG, WEBP, hasta 50 MB.";
    }

    const sizeInMb = selectedFile.size / (1024 * 1024);
    return `${selectedFile.name} (${sizeInMb.toFixed(1)} MB)`;
  }, [selectedFile]);

  const handleFileSelection = (fileList) => {
    if (isSubmitting) {
      return;
    }

    const nextFile = fileList?.[0];

    if (!nextFile) {
      return;
    }

    setSelectedFile(nextFile);
  };

  const handleConfirm = () => {
    if (!selectedFile || isSubmitting) {
      return;
    }

    onConfirm?.(selectedFile);
  };

  return (
    <Modal
      visible={open}
      showDialog={false}
      onClick={isSubmitting ? undefined : onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="avatar-upload-modal-title"
    >
      <div className="flex size-full items-center justify-center px-[16px] py-[24px]">
        <section
          className="relative flex w-full max-w-[400px] flex-col overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[var(--shadow-e1)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex w-full flex-col gap-[16px] px-[16px] pb-[16px] pt-[16px]">
            <button
              type="button"
              className="absolute right-0 top-0 inline-flex size-9 items-center justify-center rounded-[var(--radius-2)] text-[var(--color-text-100)] transition-colors duration-150 hover:bg-[var(--color-neutral-200)]/40 hover:text-[var(--color-text-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-100)]"
              aria-label="Cerrar modal"
              onClick={isSubmitting ? undefined : onClose}
            >
              <CloseIcon className="size-3" />
            </button>

            <div className="flex w-full flex-col gap-[4px]">
              <h2
                id="avatar-upload-modal-title"
                className="w-full pr-[40px] text-[18px] font-bold leading-[22px] tracking-[-0.5px] text-[var(--color-text-300)]"
              >
                Avatar
              </h2>

              <div className="w-full">
                <FileUploadSection
                  className="w-full"
                  title="Avatar"
                  chooseFileLabel="Elige un archivo"
                  separatorLabel="O"
                  dropLabel="Arrastra y suelta"
                  formatsLabel={selectedFileLabel}
                  files={[]}
                  showUploadedFiles={false}
                  viewportHeight={null}
                  fileInputAccept=".jpg,.jpeg,.png,.webp"
                  onFilesSelected={handleFileSelection}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full items-center gap-[16px] border-t border-[var(--color-neutral-200)] p-[16px]">
            <Button
              theme="Primary"
              type="Outline"
              size="S"
              showLeftIcon={false}
              showRightIcon={false}
              className="min-w-0 flex-1"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cerrar
            </Button>
            <Button
              theme="Primary"
              type="Solid"
              size="S"
              showLeftIcon={false}
              showRightIcon={false}
              className="min-w-0 flex-1"
              disabled={!selectedFile || isSubmitting}
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default AvatarUploadModal;
