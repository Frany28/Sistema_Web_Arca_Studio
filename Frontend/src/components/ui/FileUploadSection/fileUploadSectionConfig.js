export const FILE_UPLOAD_SECTION_DEFAULT_FILES = [
  {
    id: "completed-file",
    name: "Nombre del archivo",
    type: "PDF",
    status: "completed",
    currentSizeLabel: "200KB",
    totalSizeLabel: "200KB",
    progress: 40,
  },
  {
    id: "uploading-file",
    name: "Nombre del archivo",
    type: "JPG",
    status: "uploading",
    currentSizeLabel: "80KB",
    totalSizeLabel: "200KB",
    progress: 40,
  },
  {
    id: "failed-file",
    name: "Nombre del archivo",
    type: "OBJ",
    status: "failed",
    errorMessage: "Error al subir, por favor intenta de nuevo",
  },
];

export const FILE_UPLOAD_SECTION_DEFAULT_PROPS = {
  title: "File upload section",
  chooseFileLabel: "Elige un archivo",
  separatorLabel: "O",
  dropLabel: "Arrastra y suelta",
  formatsLabel: "Formatos JPEG, PNG, PDF y MP4, hasta 50 MB.",
  files: FILE_UPLOAD_SECTION_DEFAULT_FILES,
  "aria-label": "File upload section",
};

export function createFileUploadSectionProps(overrides = {}) {
  return {
    ...FILE_UPLOAD_SECTION_DEFAULT_PROPS,
    ...overrides,
  };
}
