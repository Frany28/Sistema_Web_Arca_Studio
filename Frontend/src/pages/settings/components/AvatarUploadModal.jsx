import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "../../../components/ui/Modal/Modal.jsx";
import Button from "../../../components/ui/Button/Button.jsx";
import FileUploadSection from "../../../components/ui/FileUploadSection/FileUploadSection.jsx";

const AVATAR_UPLOAD_INITIAL_STATE = {
  errorMessage: "",
  file: null,
  progress: 0,
  status: "idle",
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

function AvatarUploadModal({
  isSubmitting = false,
  open,
  onClose,
  onConfirm,
  onUpload,
}) {
  const uploadAbortControllerRef = useRef(null);
  const [uploadState, setUploadState] = useState(AVATAR_UPLOAD_INITIAL_STATE);
  const isUploadBusy = isSubmitting || uploadState.status === "uploading";

  const resetUploadState = useCallback(() => {
    uploadAbortControllerRef.current?.abort();
    uploadAbortControllerRef.current = null;
    setUploadState(AVATAR_UPLOAD_INITIAL_STATE);
  }, []);

  const handleClose = useCallback(() => {
    resetUploadState();
    onClose?.();
  }, [onClose, resetUploadState]);

  useEffect(() => {
    if (!open) {
      const frameId = window.requestAnimationFrame(() => {
        resetUploadState();
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    return undefined;
  }, [open, resetUploadState]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, open]);

  const uploadFile = useCallback(
    async (file) => {
      if (!file || isUploadBusy) {
        return;
      }

      uploadAbortControllerRef.current?.abort();
      const abortController = new AbortController();
      uploadAbortControllerRef.current = abortController;

      setUploadState({
        errorMessage: "",
        file,
        progress: 0,
        status: "uploading",
      });

      try {
        const result = await onUpload?.(file, {
          onUploadProgress: ({ progress }) => {
            setUploadState((current) => {
              if (current.file !== file) {
                return current;
              }

              return {
                ...current,
                progress,
                status: "uploading",
              };
            });
          },
          signal: abortController.signal,
        });

        setUploadState((current) => {
          if (current.file !== file) {
            return current;
          }

          return {
            ...current,
            progress: 100,
            result,
            status: "completed",
          };
        });
      } catch (error) {
        if (error.code === "UPLOAD_ABORTED") {
          return;
        }

        setUploadState((current) => {
          if (current.file !== file) {
            return current;
          }

          return {
            ...current,
            errorMessage:
              error.message || "Error al subir, por favor intenta de nuevo",
            progress: 0,
            status: "failed",
          };
        });
      } finally {
        if (uploadAbortControllerRef.current === abortController) {
          uploadAbortControllerRef.current = null;
        }
      }
    },
    [isUploadBusy, onUpload],
  );

  const selectedFiles = useMemo(() => {
    const selectedFile = uploadState.file;

    if (!selectedFile) {
      return [];
    }

    const sizeInKb = Math.max(Math.ceil(selectedFile.size / 1024), 1);
    const type = selectedFile.name.split(".").pop()?.toUpperCase() || "FILE";
    const isFailed = uploadState.status === "failed";

    return [
      {
        currentSizeLabel: `${sizeInKb}KB`,
        errorMessage:
          uploadState.errorMessage ||
          "Error al subir, por favor intenta de nuevo",
        id: `${selectedFile.name}-${selectedFile.lastModified}`,
        name: selectedFile.name,
        onRemove:
          uploadState.status === "uploading" ? resetUploadState : undefined,
        onRetryUpload: isFailed ? () => uploadFile(selectedFile) : undefined,
        progress: uploadState.progress,
        status: uploadState.status,
        totalSizeLabel: `${sizeInKb}KB`,
        type: type === "JPEG" ? "JPG" : type,
      },
    ];
  }, [resetUploadState, uploadFile, uploadState]);

  const handleFileSelection = (fileList) => {
    if (isUploadBusy) {
      return;
    }

    const nextFile = fileList?.[0];

    if (!nextFile) {
      return;
    }

    uploadFile(nextFile);
  };

  const handleConfirm = () => {
    if (uploadState.status !== "completed" || isUploadBusy) {
      return;
    }

    onConfirm?.(uploadState.result);
  };

  return (
    <Modal
      visible={open}
      showDialog={false}
      onClick={handleClose}
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
              onClick={handleClose}
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
                  formatsLabel="Formatos JPEG, PNG, WEBP, hasta 50 MB."
                  files={selectedFiles}
                  showUploadedFiles={selectedFiles.length > 0}
                  viewportHeight={null}
                  fileInputAccept=".jpg,.jpeg,.png,.webp"
                  onFilesSelected={handleFileSelection}
                  onRetryUpload={() => {
                    if (uploadState.file) {
                      uploadFile(uploadState.file);
                    }
                  }}
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
              onClick={handleClose}
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
              disabled={uploadState.status !== "completed" || isUploadBusy}
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
