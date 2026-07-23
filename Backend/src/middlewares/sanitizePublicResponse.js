import { sanitizePublicPayload } from "../utils/publicPayload.js";

export function sanitizePublicResponse(_req, res, next) {
  const sendJson = res.json.bind(res);
  res.json = (payload) => sendJson(sanitizePublicPayload(payload));
  next();
}
