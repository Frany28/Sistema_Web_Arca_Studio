import { sanitizePublicPayload } from "../utils/publicPayload.js";

/**
 * Sanea el valor de público response antes de exponerlo fuera del backend.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {import("express").Request} _req - Solicitud HTTP que este controlador no necesita inspeccionar.
 * @param {import("express").Response} res - Respuesta HTTP utilizada para devolver el resultado.
 * @param {Function} next - Función que entrega errores o continúa la cadena de middlewares.
 * @returns {void} Finalización de la operación.
 */
export function sanitizePublicResponse(_req, res, next) {
  const sendJson = res.json.bind(res);
  res.json = (payload) => sendJson(sanitizePublicPayload(payload));
  next();
}
