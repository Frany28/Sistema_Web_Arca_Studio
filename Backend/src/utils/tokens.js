import crypto from "node:crypto";

/**
 * Procesa el valor de base64 URL encode para completar la responsabilidad asignada al módulo.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

/**
 * Procesa el valor de base64 URL decode para completar la responsabilidad asignada al módulo.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

/**
 * Procesa el valor de sign para completar la responsabilidad asignada al módulo.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} input - Valor de `input` requerido por esta operación.
 * @param {unknown} secret - Valor de `secret` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function sign(input, secret) {
  return crypto.createHmac("sha256", secret).update(input).digest("base64url");
}

/**
 * Crea el valor de autenticación token con los datos validados recibidos.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} payload - Datos validados necesarios para completar la operación.
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {unknown} options.expiresInSeconds - Valor de `options.expiresInSeconds` requerido por esta operación.
 * @param {unknown} options.secret - Valor de `options.secret` requerido por esta operación.
 * @returns {string} Resultado producido por la operación.
 */
export function createAuthToken(payload, { expiresInSeconds, secret }) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const body = {
    ...payload,
    exp: now + Number(expiresInSeconds),
    iat: now,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signature = sign(`${encodedHeader}.${encodedBody}`, secret);

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

/**
 * Verifica el valor de autenticación token y rechaza valores vencidos o inconsistentes.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {string} token - Valor de `token` requerido por esta operación.
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {unknown} options.secret - Valor de `options.secret` requerido por esta operación.
 * @returns {object} Resultado producido por la operación.
 */
export function verifyAuthToken(token, { secret }) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedBody, signature] = parts;
  const expectedSignature = sign(`${encodedHeader}.${encodedBody}`, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    const payload = JSON.parse(base64UrlDecode(encodedBody));
    const now = Math.floor(Date.now() / 1000);

    if (
      !header ||
      header.alg !== "HS256" ||
      header.typ !== "JWT" ||
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      !Number.isFinite(Number(payload.exp)) ||
      Number(payload.exp) <= now ||
      !Number.isFinite(Number(payload.iat)) ||
      Number(payload.iat) > now + 60
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
