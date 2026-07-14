import { ValidationError } from "../errors/appError.js";

function toFields(issues) {
  return Object.fromEntries(issues.map((issue) => [issue.path.join(".") || "request", issue.message]));
}

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
