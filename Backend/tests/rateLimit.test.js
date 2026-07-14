import assert from "node:assert/strict";
import test from "node:test";
import { createRateLimit } from "../src/middlewares/rateLimit.js";

test("rate limiter returns stable 429 and Retry-After", () => {
  const middleware = createRateLimit({ name: `test-${Date.now()}`, max: 1, windowMs: 60000, key: () => "same" });
  const req = { body: {}, headers: {}, socket: {} };
  let nextCalls = 0;
  const response = { headers: {}, setHeader(name, value) { this.headers[name] = value; }, status(value) { this.statusCode = value; return this; }, json(value) { this.body = value; } };
  middleware(req, response, () => { nextCalls += 1; });
  middleware(req, response, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
  assert.equal(response.statusCode, 429);
  assert.equal(response.body.code, "RATE_LIMITED");
  assert.ok(Number(response.headers["Retry-After"]) > 0);
});
