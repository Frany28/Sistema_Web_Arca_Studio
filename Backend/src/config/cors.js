const isProduction = process.env.NODE_ENV === "production";
const defaultOrigins = isProduction
  ? ["https://arcastudio.netlify.app"]
  : ["http://localhost:5173"];

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

function isWildcardSubdomainOrigin(origin) {
  try {
    const url = new URL(origin);
    return url.hostname.startsWith("*.");
  } catch {
    return false;
  }
}

function originMatches(allowedOrigin, requestOrigin) {
  if (allowedOrigin === "*") {
    return true;
  }

  if (allowedOrigin === requestOrigin) {
    return true;
  }

  if (!isWildcardSubdomainOrigin(allowedOrigin)) {
    return false;
  }

  try {
    const allowedUrl = new URL(allowedOrigin);
    const requestUrl = new URL(requestOrigin);
    const allowedSuffix = allowedUrl.hostname.slice(1);

    return (
      allowedUrl.protocol === requestUrl.protocol &&
      allowedUrl.port === requestUrl.port &&
      requestUrl.hostname.endsWith(allowedSuffix) &&
      requestUrl.hostname !== allowedSuffix.slice(1)
    );
  } catch {
    return false;
  }
}

export function getAllowedOrigins() {
  const configuredOrigins = mergeUnique([
    ...defaultOrigins,
    ...parseList(process.env.CORS_ORIGIN),
    ...parseList(process.env.CORS_ORIGINS),
    ...parseList(process.env.FRONTEND_URL),
  ]);

  return configuredOrigins.map(normalizeOrigin);
}

export function isAllowedOrigin(origin) {
  if (!origin) {
    return false;
  }

  return getAllowedOrigins().some((allowedOrigin) =>
    originMatches(allowedOrigin, origin),
  );
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

      if (
        allowedOrigins.some((allowedOrigin) =>
          originMatches(allowedOrigin, origin),
        )
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
  };
}
