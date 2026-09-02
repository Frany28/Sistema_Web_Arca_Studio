import crypto from "node:crypto";
import { getPoolStats } from "../config/db.js";

/**
 * Determina si está habilitado la operación enabled según la configuración del entorno.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @returns {boolean} Resultado producido por la operación.
 */
function enabled() {
  return String(process.env.REQUEST_METRICS_ENABLED || "false").toLowerCase() === "true";
}

/**
 * Procesa el valor de solicitud métricas para completar la responsabilidad asignada al módulo.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @param {import("express").Response} res - Respuesta HTTP utilizada para devolver el resultado.
 * @param {Function} next - Función que entrega errores o continúa la cadena de middlewares.
 * @returns {void} Finalización de la operación.
 */
export function requestMetrics(req, res, next) {
  if (!enabled()) {
    next();
    return;
  }

  const startedAt = process.hrtime.bigint();
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const memory = process.memoryUsage();

    console.log(JSON.stringify({
      type: "http_request",
      requestId,
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      contentLength: Number(req.headers["content-length"] || 0),
      rssBytes: memory.rss,
      heapUsedBytes: memory.heapUsed,
      databasePool: getPoolStats(),
      timestamp: new Date().toISOString(),
    }));
  });

  next();
}
