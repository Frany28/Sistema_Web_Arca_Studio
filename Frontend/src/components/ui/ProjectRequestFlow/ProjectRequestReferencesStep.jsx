import FileUploadSection from "../FileUploadSection.jsx";
import HintText from "../HintText/HintText.jsx";
import Input from "../Input/Input.jsx";
import Label from "../Label/Label.jsx";
import ProjectRequestModalShell from "./ProjectRequestModalShell.jsx";

const ALLOWED_FILE_EXTENSIONS = new Set(["jpeg", "jpg", "mp4", "pdf", "png"]);
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "video/mp4",
]);
const MAX_FILE_NAME_LENGTH = 150;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

function getFileExtension(fileName) {
  const normalized = String(fileName || "").trim().toLowerCase();
  const lastDotIndex = normalized.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === normalized.length - 1) {
    return "";
  }

  return normalized.slice(lastDotIndex + 1);
}

function getFileError(file, existingFiles) {
  const extension = getFileExtension(file.name);
  const normalizedName = String(file.name || "").trim().toLowerCase();

  if (!file.name || file.name.length > MAX_FILE_NAME_LENGTH) {
    return `El nombre del archivo no puede superar ${MAX_FILE_NAME_LENGTH} caracteres`;
  }

  if (
    existingFiles.some((item) => {
      const existingFile = item.file || item;
      return String(existingFile.name || "").trim().toLowerCase() === normalizedName;
    })
  ) {
    return "Ese archivo ya esta seleccionado";
  }

  if (!ALLOWED_FILE_EXTENSIONS.has(extension) || !ALLOWED_FILE_TYPES.has(file.type)) {
    return "Solo se permiten archivos JPEG, PNG, PDF y MP4";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "El archivo supera el tamano permitido de 50 MB";
  }

  return "";
}

function LinkIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.72499 10C2.06665 9.20833 1.66666 8.19167 1.66666 7.08333C1.66666 4.56667 3.72499 2.5 6.24999 2.5H10.4167C12.9333 2.5 15 4.56667 15 7.08333C15 9.6 12.9417 11.6667 10.4167 11.6667H8.33332"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.275 10.0002C17.9333 10.7918 18.3333 11.8085 18.3333 12.9168C18.3333 15.4335 16.275 17.5002 13.75 17.5002H9.58333C7.06667 17.5002 5 15.4335 5 12.9168C5 10.4002 7.05833 8.3335 9.58333 8.3335H11.6667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectRequestReferencesStep({
  open,
  onClose,
  onPrevious,
  onNext,
  values,
  uploadedFiles,
  submitError = "",
  onReferenceLinkChange,
  onFilesChange,
}) {
  const handleFilesSelected = (fileList) => {
    const nextFiles = Array.from(fileList || []);

    if (nextFiles.length === 0) {
      return;
    }

    const filesToAdd = [];
    const existingFiles = [...(uploadedFiles || [])];

    for (const file of nextFiles) {
      const errorMessage = getFileError(file, existingFiles);
      const fileItem = {
        canUpload: !errorMessage,
        errorMessage,
        file,
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        loadedBytes: 0,
        progress: 0,
        status: errorMessage ? "failed" : "pending",
        totalBytes: file.size || 0,
        uploadResult: null,
      };

      filesToAdd.push(fileItem);
      existingFiles.push(fileItem);
    }

    onFilesChange?.([...(uploadedFiles || []), ...filesToAdd]);
  };

  const visibleFiles = (uploadedFiles || []).map((fileItem) => {
    const file = fileItem.file || fileItem;
    const fileSize = file.size || 0;
    const loadedSize =
      fileItem.status === "completed"
        ? fileSize
        : Math.min(fileItem.loadedBytes || 0, fileSize);
    const formatFileSize = (size) =>
      size >= 1024 * 1024
        ? `${(size / (1024 * 1024)).toFixed(1)}MB`
        : `${Math.max(Math.ceil(size / 1024), size > 0 ? 1 : 0)}KB`;
    const totalSizeLabel =
      fileItem.totalBytes || fileSize
        ? formatFileSize(fileItem.totalBytes || fileSize)
        : "0KB";
    const currentSizeLabel = formatFileSize(loadedSize);

    return {
      currentSizeLabel,
      errorMessage: fileItem.errorMessage,
      id: fileItem.id,
      name: file.name,
      onRemove:
        fileItem.status === "uploading"
          ? undefined
          : () => {
              onFilesChange?.(
                (uploadedFiles || []).filter((item) => item.id !== fileItem.id),
              );
            },
      onRetryUpload: fileItem.onRetryUpload,
      progress: fileItem.progress || 0,
      status: fileItem.status || "pending",
      totalSizeLabel,
      type: file.type || "Archivo",
    };
  });

  return (
    <ProjectRequestModalShell
      open={open}
      sectionTitle="Referencias"
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      nextLabel="Siguiente"
    >
      <div className="flex w-full flex-col gap-[16px]">
        <div className="flex w-full flex-col gap-[8px]">
          <Label
            label="Subir imágenes / archivos (opcional)"
            required={false}
            information={false}
          />
          <FileUploadSection
            className="w-full"
            files={visibleFiles}
            showUploadedFiles={visibleFiles.length > 0}
            viewportHeight={null}
            onFilesSelected={handleFilesSelected}
          />
          {submitError ? (
            <HintText state="Error" hintText={submitError} className="w-full" />
          ) : null}
        </div>

        <Input
          label="Link de referencia (Pinterest, web, etc.)"
          required={false}
          showLabelInfo={false}
          showHint={false}
          size="S"
          type="Default input"
          placeholder='Ej. “https://es.pinterest.com/pin”'
          leftIcon={<LinkIcon className="size-5" />}
          rightIcon={null}
          showLeftIcon
          showRightIcon={false}
          value={values.referenceLink}
          onChange={(event) => onReferenceLinkChange?.(event.target.value)}
          className="w-full max-w-none"
        />
      </div>
    </ProjectRequestModalShell>
  );
}

export default ProjectRequestReferencesStep;
