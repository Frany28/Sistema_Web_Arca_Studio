import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Interpreta el valor de boolean y descarta los formatos que no sean válidos.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @param {unknown} fallback - Valor de `fallback` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function parseBoolean(value, fallback) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

/**
 * Determina si el valor de local base de datos cumple la condición esperada.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @param {string} url - Valor de `url` requerido por esta operación.
 * @returns {boolean} Resultado producido por la operación.
 */
function isLocalDatabase(url) {
  try {
    const { hostname } = new URL(url);
    return ["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

/**
 * Obtiene el valor de ssl configuración para que el flujo llamador pueda continuar.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @returns {boolean} Resultado producido por la operación.
 */
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

/**
 * Determina si el valor de serverless runtime cumple la condición esperada.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @returns {boolean} Resultado producido por la operación.
 */
function isServerlessRuntime() {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.FUNCTIONS_WORKER_RUNTIME,
  );
}

/**
 * Obtiene el valor de pool max para que el flujo llamador pueda continuar.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @returns {unknown} Resultado producido por la operación.
 */
function getPoolMax() {
  const configured = Number(process.env.DATABASE_POOL_MAX);
  if (Number.isInteger(configured) && configured > 0) {
    return configured;
  }

  // Serverless instances scale horizontally. Keeping a large pool per instance
  // can exhaust the database connection limit during traffic bursts.
  if (isServerlessRuntime()) {
    return 1;
  }

  return isLocalDatabase(databaseUrl) ? 10 : 2;
}

/**
 * Obtiene el valor de idle timeout ms para que el flujo llamador pueda continuar.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @returns {unknown} Resultado producido por la operación.
 */
function getIdleTimeoutMs() {
  const configured = Number(process.env.DATABASE_IDLE_TIMEOUT_MS);

  if (Number.isFinite(configured) && configured >= 0) {
    return configured;
  }

  return isServerlessRuntime() ? 5000 : 30000;
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

/**
 * Determina si el valor de transient base de datos error cumple la condición esperada.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @param {Error} error - Error que debe evaluarse o traducirse.
 * @returns {boolean} Resultado producido por la operación.
 */
export function isTransientDatabaseError(error) {
  if (TRANSIENT_DATABASE_ERRORS.has(error?.code)) return true;
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("connection terminated") ||
    message.includes("connection timeout") ||
    message.includes("cannot acquire a client") ||
    message.includes("emaxconnsession") ||
    message.includes("max clients reached")
  );
}

/**
 * Determina si el valor de read only query cumple la condición esperada.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @param {string} text - Valor de `text` requerido por esta operación.
 * @returns {boolean} Resultado producido por la operación.
 */
export function isReadOnlyQuery(text) {
  return String(text).trimStart().toLowerCase().startsWith("select");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: getSslConfig(),
  max: getPoolMax(),
  allowExitOnIdle: isServerlessRuntime(),
  idleTimeoutMillis: getIdleTimeoutMs(),
  connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS || 5000),
  statement_timeout: Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS || 10000),
  query_timeout: Number(process.env.DATABASE_QUERY_TIMEOUT_MS || 12000),
});

/**
 * Ejecuta el valor de query y registra la información operativa relevante.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @param {string} text - Valor de `text` requerido por esta operación.
 * @param {unknown} params - Valor de `params` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
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

/**
 * Procesa el valor de query para completar la responsabilidad asignada al módulo.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @param {string} text - Valor de `text` requerido por esta operación.
 * @param {unknown} params - Valor de `params` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
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

/**
 * Obtiene las estadísticas del pool de PostgreSQL para que el flujo llamador pueda continuar.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @returns {object} Resultado producido por la operación.
 */
export function getPoolStats() {
  return { idle: pool.idleCount, total: pool.totalCount, waiting: pool.waitingCount };
}
