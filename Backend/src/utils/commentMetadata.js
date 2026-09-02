const RESOURCE_LINK_KEYS = new Set([
  "src",
  "imagesrc",
  "url",
  "fileurl",
  "downloadurl",
]);

/**
 * Determina si el valor de resource enlace cumple la condición esperada.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {boolean} Resultado producido por la operación.
 */
function isResourceLink(value) {
  return (
    typeof value === "string" &&
    /^(?:(?:https?:)?\/\/|s3:\/\/|\/api\/)|\/storage\/v1\/object\//i.test(value.trim())
  );
}

/**
 * Sanea el valor de comentario metadatos antes de exponerlo fuera del backend.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function sanitizeCommentMetadata(value) {
  if (Array.isArray(value)) {
    return value
      .map(sanitizeCommentMetadata)
      .filter((item) => item !== undefined);
  }

  if (!value || typeof value !== "object") {
    return isResourceLink(value) ? undefined : value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !RESOURCE_LINK_KEYS.has(key.toLowerCase()))
      .map(([key, item]) => [key, sanitizeCommentMetadata(item)])
      .filter(([, item]) => item !== undefined),
  );
}
