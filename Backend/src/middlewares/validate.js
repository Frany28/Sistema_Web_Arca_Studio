import { ValidationError } from "../errors/appError.js";

/**
 * Transforma el valor de fields a la representación pública esperada.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {Array<unknown>} issues - Valor de `issues` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function toFields(issues) {
  return Object.fromEntries(issues.map((issue) => [issue.path.join(".") || "request", issue.message]));
}

/**
 * Valida la operación validate y genera un error cuando no cumple el contrato.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {unknown} schema - Valor de `schema` requerido por esta operación.
 * @returns {boolean} Resultado producido por la operación.
 */
export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) return next(new ValidationError(undefined, toFields(result.error.issues)));
    if (result.data.body) req.body = result.data.body;
    if (result.data.params) req.params = result.data.params;
    req.validatedQuery = result.data.query || req.query;
    next();
  };
}
