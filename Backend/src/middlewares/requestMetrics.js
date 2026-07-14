import crypto from "node:crypto";
import { getPoolStats } from "../config/db.js";

function enabled() {
  return String(process.env.REQUEST_METRICS_ENABLED || "false").toLowerCase() === "true";
}

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
