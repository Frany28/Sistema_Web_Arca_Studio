/**
 * Obtiene el valor de carga stream para que el flujo llamador pueda continuar.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @param {number} maxBytes - Valor de `maxBytes` requerido por esta operación.
 * @returns {object} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
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
