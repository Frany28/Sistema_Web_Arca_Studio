export function getUploadStream(req, maxBytes) {
  const contentLength = Number(req.headers["content-length"]);
  if (!Number.isInteger(contentLength) || contentLength <= 0) {
    const error = new Error("Content-Length is required");
    error.code = "FILE_LENGTH_REQUIRED";
    error.status = 411;
    error.publicMessage = "El tamaño del archivo debe ser conocido antes de subirlo.";
    throw error;
  }
  if (contentLength > maxBytes) {
    const error = new Error("File is too large");
    error.code = "FILE_TOO_LARGE";
    error.status = 413;
    error.publicMessage = "El archivo supera el tamaño permitido.";
    throw error;
  }
  return { body: req, size: contentLength };
}
