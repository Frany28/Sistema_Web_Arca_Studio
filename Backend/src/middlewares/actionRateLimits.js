import { createRateLimit } from "./rateLimit.js";

/**
 * Procesa el valor de env number para completar la responsabilidad asignada al módulo.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {string} name - Valor de `name` requerido por esta operación.
 * @param {unknown} fallback - Valor de `fallback` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function envNumber(name, fallback) { return Number(process.env[name] || fallback); }

export const commentRateLimit = createRateLimit({ name: "comments", max: envNumber("COMMENT_RATE_LIMIT_MAX", 30), windowMs: envNumber("COMMENT_RATE_LIMIT_WINDOW_MS", 60000) });
export const requestRateLimit = createRateLimit({ name: "project-requests", max: envNumber("PROJECT_REQUEST_RATE_LIMIT_MAX", 10), windowMs: envNumber("PROJECT_REQUEST_RATE_LIMIT_WINDOW_MS", 60000) });
export const uploadRateLimit = createRateLimit({ name: "uploads", max: envNumber("UPLOAD_RATE_LIMIT_MAX", 20), windowMs: envNumber("UPLOAD_RATE_LIMIT_WINDOW_MS", 60000) });
