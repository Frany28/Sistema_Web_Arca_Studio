const DEFAULT_AUTH_TOKEN_CLOCK_TOLERANCE_MS = 5000;

/**
 * Obtiene el valor de clock tolerance ms para que el flujo llamador pueda continuar.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @returns {unknown} Resultado producido por la operación.
 */
function getClockToleranceMs() {
  const configuredValue = Number(
    process.env.AUTH_TOKEN_CLOCK_TOLERANCE_MS ||
      DEFAULT_AUTH_TOKEN_CLOCK_TOLERANCE_MS,
  );

  return Number.isFinite(configuredValue)
    ? Math.max(configuredValue, 0)
    : DEFAULT_AUTH_TOKEN_CLOCK_TOLERANCE_MS;
}

/**
 * Determina si el valor de token older than usuario cumple la condición esperada.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} payload - Datos validados necesarios para completar la operación.
 * @param {unknown} user - Usuario autenticado que ejecuta la operación.
 * @param {unknown} [clockToleranceMs] - Valor de `clockToleranceMs` requerido por esta operación.
 * @returns {boolean} Resultado producido por la operación.
 */
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
