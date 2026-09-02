const IMMUTABLE_CACHE_SECONDS = 31_536_000;
const FALLBACK_CACHE_SECONDS = 300;

/**
 * Transforma el valor de positive integer a la representación pública esperada.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function toPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

/**
 * Obtiene los encabezados de caché del archivo de proyecto para que el flujo llamador pueda continuar.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.currentVersionId - Valor de `options.currentVersionId` requerido por esta operación.
 * @param {string} options.fileId - Valor de `options.fileId` requerido por esta operación.
 * @param {string} options.requestedVersionId - Valor de `options.requestedVersionId` requerido por esta operación.
 * @returns {object} Resultado producido por la operación.
 */
export function getProjectFileCacheHeaders({
  currentVersionId,
  fileId,
  requestedVersionId,
}) {
  const safeCurrentVersionId = toPositiveInteger(currentVersionId);
  const safeRequestedVersionId = toPositiveInteger(requestedVersionId);
  const safeFileId = toPositiveInteger(fileId);
  const isCurrentVersion =
    safeCurrentVersionId !== null &&
    safeRequestedVersionId === safeCurrentVersionId;

  return {
    cacheControl: isCurrentVersion
      ? `private, max-age=${IMMUTABLE_CACHE_SECONDS}, immutable`
      : `private, max-age=${FALLBACK_CACHE_SECONDS}`,
    etag:
      safeFileId && safeCurrentVersionId
        ? `"project-file-${safeFileId}-version-${safeCurrentVersionId}"`
        : null,
  };
}
