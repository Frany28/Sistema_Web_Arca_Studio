import { authConfig } from "../config/auth.js";
import { createRateLimit } from "./rateLimit.js";

export const loginRateLimit = createRateLimit({
  name: "login",
  max: authConfig.loginRateLimitMax,
  windowMs: authConfig.loginRateLimitWindowMs,
});
