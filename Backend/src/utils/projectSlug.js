/**
 * Convierte el valor de proyecto nombre en un identificador legible y seguro para URL.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function slugifyProjectName(value) {
  const normalized = String(value || "proyecto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "proyecto";
}

/**
 * Determina si el valor de valid proyecto slug cumple la condición esperada.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {boolean} Resultado producido por la operación.
 */
export function isValidProjectSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));
}
