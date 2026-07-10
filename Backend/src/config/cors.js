const defaultOrigins = ["http://localhost:5173"];
const isProduction = process.env.NODE_ENV === "production";

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

function parseList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeUnique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getAllowedHeaders() {
  const defaultHeaders = [
    "Accept",
    "Authorization",
    "Content-Type",
    "Origin",
    "Range",
    "X-File-Name",
    "X-Original-File-Name",
    "X-Requested-With",
  ];

  return mergeUnique([
    ...defaultHeaders,
    ...parseList(process.env.CORS_ALLOWED_HEADERS),
  ]);
}

function getExposedHeaders() {
  const defaultHeaders = [
    "Accept-Ranges",
    "Content-Disposition",
    "Content-Length",
    "Content-Range",
    "Content-Type",
  ];

  return mergeUnique([
    ...defaultHeaders,
    ...parseList(process.env.CORS_EXPOSED_HEADERS),
  ]);
}

function normalizeOrigin(origin) {
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
}

export function getAllowedOrigins() {
  const configuredOrigins = mergeUnique([
    ...parseList(process.env.CORS_ORIGIN),
    ...parseList(process.env.CORS_ORIGINS),
    ...parseList(process.env.FRONTEND_URL),
  ]);

  if (!configuredOrigins.length) {
    return defaultOrigins;
  }

  return configuredOrigins
    .map(normalizeOrigin);
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
    exposedHeaders: getExposedHeaders(),
    maxAge: 86400,
    optionsSuccessStatus: 204,
    preflightContinue: false,
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
