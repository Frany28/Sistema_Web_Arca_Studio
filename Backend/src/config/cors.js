const defaultOrigins = ["http://localhost:5173"];

export function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;

  if (!configuredOrigins) {
    return defaultOrigins;
  }

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function corsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
  };
}
