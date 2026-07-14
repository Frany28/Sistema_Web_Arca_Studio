const DEFAULT_AUTH_TOKEN_CLOCK_TOLERANCE_MS = 5000;

function getClockToleranceMs() {
  const configuredValue = Number(
    process.env.AUTH_TOKEN_CLOCK_TOLERANCE_MS ||
      DEFAULT_AUTH_TOKEN_CLOCK_TOLERANCE_MS,
  );

  return Number.isFinite(configuredValue)
    ? Math.max(configuredValue, 0)
    : DEFAULT_AUTH_TOKEN_CLOCK_TOLERANCE_MS;
}

export function isTokenOlderThanUser(
  payload,
  user,
  clockToleranceMs = getClockToleranceMs(),
) {
  if (!payload.iat || !user.updatedAt) {
    return false;
  }

  const tokenIssuedAt = Number(payload.iat) * 1000;
  const userUpdatedAt = new Date(user.updatedAt).getTime();

  if (!Number.isFinite(tokenIssuedAt) || !Number.isFinite(userUpdatedAt)) {
    return true;
  }

  return userUpdatedAt > tokenIssuedAt + Math.max(clockToleranceMs, 0);
}
