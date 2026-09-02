const PRIVATE_RESOURCE_KEYS = new Set([
  "downloadurl",
  "endpoint",
  "fileurl",
  "href",
  "imagesrc",
  "profilephotourl",
  "signedurl",
  "src",
  "storagekey",
  "uri",
]);

const ALLOWED_EXTERNAL_LINK_KEYS = new Set(["referencelink"]);

/**
 * Normaliza el valor de key para mantener un formato interno consistente.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {string} key - Valor de `key` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function normalizeKey(key) {
  return String(key || "").toLowerCase().replaceAll(/[^a-z0-9]/g, "");
}

/**
 * Determina si el valor de URL like cumple la condición esperada.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {boolean} Resultado producido por la operación.
 */
function isUrlLike(value) {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return (
    /^(?:https?:)?\/\//i.test(normalized) ||
    /^s3:\/\//i.test(normalized) ||
    /^\/api\//i.test(normalized) ||
    /\/storage\/v1\/object\//i.test(normalized) ||
    /\/api\/projects\/[^/]+\/files\/\d+\/content(?:[/?#]|$)/i.test(normalized) ||
    /\/api\/projects\/[^/]+\/assigned-architect\/profile-photo(?:[/?#]|$)/i.test(normalized) ||
    /\/api\/projects\/[^/]+\/comment-authors\/\d+\/profile-photo(?:[/?#]|$)/i.test(normalized) ||
    /\/api\/auth\/profile-photo\/image(?:[/?#]|$)/i.test(normalized)
  );
}

/**
 * Sanea el valor de público datos antes de exponerlo fuera del backend.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @param {string} [parentKey] - Valor de `parentKey` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function sanitizePublicPayload(value, parentKey = "") {
  if (Array.isArray(value)) {
    const sanitizedItems = value
      .map((item) => sanitizePublicPayload(item, parentKey))
      .filter((item) => item !== undefined);
    return value.length > 0 && sanitizedItems.length === 0
      ? undefined
      : sanitizedItems;
  }

  if (
    isUrlLike(value) &&
    !ALLOWED_EXTERNAL_LINK_KEYS.has(normalizeKey(parentKey))
  ) {
    return undefined;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !PRIVATE_RESOURCE_KEYS.has(normalizeKey(key)))
      .map(([key, item]) => [key, sanitizePublicPayload(item, key)])
      .filter(([, item]) => item !== undefined),
  );
}
