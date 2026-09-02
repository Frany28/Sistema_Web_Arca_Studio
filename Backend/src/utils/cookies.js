/**
 * Interpreta el valor de cookies y descarta los formatos que no sean válidos.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {string} [cookieHeader] - Valor de `cookieHeader` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      return cookies;
    }

    const name = cookie.slice(0, separatorIndex).trim();
    const value = cookie.slice(separatorIndex + 1).trim();

    if (!name) {
      return cookies;
    }

    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}

/**
 * Serializa la cookie HTTP con los atributos HTTP solicitados.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {string} name - Valor de `name` requerido por esta operación.
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @param {unknown} [options] - Opciones agrupadas necesarias para ejecutar la operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function serializeCookie(name, value, options = {}) {
  const segments = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  if (options.expires) {
    segments.push(`Expires=${options.expires.toUTCString()}`);
  }

  segments.push(`Path=${options.path || "/"}`);

  if (options.httpOnly !== false) {
    segments.push("HttpOnly");
  }

  if (options.secure) {
    segments.push("Secure");
  }

  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`);
  }

  return segments.join("; ");
}
