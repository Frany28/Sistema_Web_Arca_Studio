import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

function isLocalDatabase(url) {
  try {
    const { hostname } = new URL(url);
    return ["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

function getSslConfig() {
  if (!parseBoolean(process.env.DATABASE_SSL, true)) {
    return false;
  }

  if (isLocalDatabase(databaseUrl)) {
    return false;
  }

  const sslConfig = {
    rejectUnauthorized: parseBoolean(
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
      false,
    ),
  };

  if (process.env.DATABASE_SSL_CA_CERT) {
    sslConfig.ca = process.env.DATABASE_SSL_CA_CERT.replace(/\\n/g, "\n");
    sslConfig.rejectUnauthorized = true;
  }

  return sslConfig;
}

function isServerlessRuntime() {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.FUNCTIONS_WORKER_RUNTIME,
  );
}

function getPoolMax() {
  const configured = Number(process.env.DATABASE_POOL_MAX);
  if (Number.isInteger(configured) && configured > 0) {
    return configured;
  }

  // Serverless instances scale horizontally. Keeping a large pool per instance
  // can exhaust the database connection limit during traffic bursts.
  return isServerlessRuntime() ? 3 : 10;
}

const TRANSIENT_DATABASE_ERRORS = new Set([
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  "08007",
  "08P01",
  "53300",
  "57P01",
  "57P02",
  "57P03",
  "ECONNRESET",
  "ETIMEDOUT",
]);

export function isTransientDatabaseError(error) {
  if (TRANSIENT_DATABASE_ERRORS.has(error?.code)) return true;
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("connection terminated") ||
    message.includes("connection timeout") ||
    message.includes("cannot acquire a client")
  );
}

export function isReadOnlyQuery(text) {
  return String(text).trimStart().toLowerCase().startsWith("select");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: getSslConfig(),
  max: getPoolMax(),
  allowExitOnIdle: isServerlessRuntime(),
  idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS || 5000),
  statement_timeout: Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS || 10000),
  query_timeout: Number(process.env.DATABASE_QUERY_TIMEOUT_MS || 12000),
});

function executeQuery(text, params) {
  const startedAt = process.hrtime.bigint();
  return pool.query(text, params).finally(() => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const threshold = Number(process.env.DATABASE_SLOW_QUERY_MS || 500);
    if (durationMs >= threshold) {
      console.warn(JSON.stringify({
        type: "slow_query",
        durationMs: Number(durationMs.toFixed(2)),
        operation: String(text).trim().split(/\s+/)[0]?.toUpperCase() || "UNKNOWN",
        pool: getPoolStats(),
        timestamp: new Date().toISOString(),
      }));
    }
  });
}

export async function query(text, params) {
  try {
    return await executeQuery(text, params);
  } catch (error) {
    if (!isReadOnlyQuery(text) || !isTransientDatabaseError(error)) throw error;
    console.warn(JSON.stringify({
      type: "database_query_retry",
      code: error?.code || "CONNECTION_ERROR",
      operation: String(text).trim().split(/\s+/)[0]?.toUpperCase() || "UNKNOWN",
      pool: getPoolStats(),
      timestamp: new Date().toISOString(),
    }));
    return executeQuery(text, params);
  }
}

export function getPoolStats() {
  return { idle: pool.idleCount, total: pool.totalCount, waiting: pool.waitingCount };
}
