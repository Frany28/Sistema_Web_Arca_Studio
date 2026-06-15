const defaultOrigins = ["http://localhost:5173"];
const isProduction = process.env.NODE_ENV === "production";

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

function getAllowedHeaders() {
  const defaultHeaders = [
    "Authorization",
    "Content-Type",
    "X-File-Name",
    "X-Original-File-Name",
  ];
  const configuredHeaders = process.env.CORS_ALLOWED_HEADERS;

  if (!configuredHeaders) {
    return defaultHeaders;
  }

  const extraHeaders = configuredHeaders
    .split(",")
    .map((header) => header.trim())
    .filter(Boolean);

  return [...new Set([...defaultHeaders, ...extraHeaders])];
}

export function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;

  if (!configuredOrigins) {
    return defaultOrigins;
  }

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      if (origin === "*") {
        if (isProduction) {
          throw new Error("CORS wildcard origin is not allowed in production");
        }

        return origin;
      }

      try {
        return new URL(origin).origin;
      } catch {
        throw new Error(`Invalid CORS origin: ${origin}`);
      }
    });
}

export function corsOptions() {
  const allowedOrigins = getAllowedOrigins();
  const allowRequestsWithoutOrigin = parseBoolean(
    process.env.CORS_ALLOW_NO_ORIGIN,
    !isProduction,
  );

  return {
    credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: getAllowedHeaders(),
    optionsSuccessStatus: 204,
    origin(origin, callback) {
      if (!origin) {
        callback(null, allowRequestsWithoutOrigin);
        return;
      }

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
  };
}
