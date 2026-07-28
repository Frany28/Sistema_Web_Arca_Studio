import { createRateLimit } from "./rateLimit.js";

function envNumber(name, fallback) { return Number(process.env[name] || fallback); }

export const commentRateLimit = createRateLimit({ name: "comments", max: envNumber("COMMENT_RATE_LIMIT_MAX", 30), windowMs: envNumber("COMMENT_RATE_LIMIT_WINDOW_MS", 60000) });
export const requestRateLimit = createRateLimit({ name: "project-requests", max: envNumber("PROJECT_REQUEST_RATE_LIMIT_MAX", 10), windowMs: envNumber("PROJECT_REQUEST_RATE_LIMIT_WINDOW_MS", 60000) });
export const uploadRateLimit = createRateLimit({ name: "uploads", max: envNumber("UPLOAD_RATE_LIMIT_MAX", 20), windowMs: envNumber("UPLOAD_RATE_LIMIT_WINDOW_MS", 60000) });
export const modelSettingsRateLimit = createRateLimit({ name: "model-settings", max: envNumber("MODEL_SETTINGS_RATE_LIMIT_MAX", 30), windowMs: envNumber("MODEL_SETTINGS_RATE_LIMIT_WINDOW_MS", 60000) });
