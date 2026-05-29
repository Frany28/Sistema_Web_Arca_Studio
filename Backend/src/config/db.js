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

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: getSslConfig(),
  max: Number(process.env.DATABASE_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS || 5000),
});

export function query(text, params) {
  return pool.query(text, params);
}
