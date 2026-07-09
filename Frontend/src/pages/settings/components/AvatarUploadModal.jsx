import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Modal from "../../../components/ui/Modal/Modal.jsx";
import Button from "../../../components/ui/Button/Button.jsx";

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

function CloudPlusIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.50004 16.6663H12.5C16.6667 16.6663 18.3334 14.9997 18.3334 10.833C18.3334 7.04967 16.9584 5.35801 13.75 5.04967C12.9584 2.65801 11.0417 1.66634 8.33337 1.66634C4.90837 1.66634 3.33337 3.24134 3.33337 6.66634C3.33337 6.94967 3.35004 7.22467 3.3917 7.49134C1.38337 8.44134 0.833374 10.033 0.833374 12.083C0.833374 15.4163 2.50004 16.6663 5.83337 16.6663"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.33301V13.333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.33337 10H11.6667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (!open) {
      const frameId = window.requestAnimationFrame(() => {
        setSelectedFile(null);
        setPreviewUrl("");
        setIsDragActive(false);
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

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      const frameId = window.requestAnimationFrame(() => {
        setPreviewUrl("");
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    const frameId = window.requestAnimationFrame(() => {
      setPreviewUrl(objectUrl);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const selectedFileLabel = useMemo(() => {
    if (!selectedFile) {
      return "Formatos JPEG, PNG, WEBP, hasta 50 MB.";
    }

    const sizeInMb = selectedFile.size / (1024 * 1024);
    return `${selectedFile.name} (${sizeInMb.toFixed(1)} MB)`;
  }, [selectedFile]);

  const handleFileSelection = (fileList) => {
    const nextFile = fileList?.[0];

    if (!nextFile) {
      return;
    }

    setSelectedFile(nextFile);
    setIsDragActive(false);
  };

  const handleChooseFile = () => {
    if (isSubmitting) {
      return;
    }

    fileInputRef.current?.click();
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
                className="w-full pr-[40px] text-heading-6 text-[var(--color-text-300)]"
              >
                Avatar
              </h2>

              <div className="w-full">
                <div className="flex w-full flex-col gap-[16px]">
                  <div
                    className={clsx(
                      "flex min-h-[337px] w-full flex-col items-center justify-center gap-[12px] rounded-[12px] border bg-[var(--color-neutral-100)] px-[24px] py-[32px] transition-colors duration-200 hover:border-[var(--color-neutral-600)] dark:hover:border-[var(--color-neutral-600)]",
                      isDragActive
                        ? "border-[var(--color-neutral-600)]"
                        : "border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-300)]",
                    )}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (isSubmitting) {
                        return;
                      }
                      setIsDragActive(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      if (event.currentTarget.contains(event.relatedTarget)) {
                        return;
                      }
                      setIsDragActive(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (isSubmitting) {
                        return;
                      }
                      handleFileSelection(event.dataTransfer.files);
                    }}
                  >
                    <div className="rounded-[8px] border border-[var(--color-neutral-200)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)]">
                      <div className="flex size-[40px] items-center justify-center rounded-[8px] bg-[var(--color-neutral-100)] p-[8px] text-[var(--color-text-300)]">
                        <CloudPlusIcon className="size-5" />
                      </div>
                    </div>

                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Vista previa del avatar"
                        className="h-[96px] w-[96px] rounded-full object-cover"
                      />
                    ) : null}

                    <div className="flex w-full flex-col items-center gap-[8px]">
                      <div className="flex w-full flex-wrap items-center justify-center gap-[8px] text-center">
                        <Button
                          theme="Primary"
                          type="Link"
                          size="S"
                          fitContent
                          showLeftIcon={false}
                          showRightIcon={false}
                          disabled={isSubmitting}
                          onClick={handleChooseFile}
                        >
                          Elige un archivo
                        </Button>
                        <span className="text-body-3 text-[var(--color-text-100)]">
                          O
                        </span>
                        <span className="text-body-3 text-[var(--color-text-100)]">
                          Arrastra y suelta
                        </span>
                      </div>

                      <p className="w-full text-center text-body-3 text-[var(--color-text-100)]">
                        {selectedFileLabel}
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="sr-only"
                      disabled={isSubmitting}
                      onChange={(event) => {
                        handleFileSelection(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </div>
                </div>
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
