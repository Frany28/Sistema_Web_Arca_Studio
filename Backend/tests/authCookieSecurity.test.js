import assert from "node:assert/strict";
import test from "node:test";

import { resolveAuthCookieConfig } from "../src/config/auth.js";
import {
  buildExpiredSessionCookie,
  buildSessionCookie,
  preventAuthResponseCaching,
} from "../src/utils/authCookies.js";

function createResponse() {
  return {
    body: null,
    headers: {},
    statusCode: null,
    end() {},
    json(body) {
      this.body = body;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
  };
}

test("production cookies are host-only, httpOnly, secure and same-site lax", () => {
  assert.deepEqual(resolveAuthCookieConfig({ NODE_ENV: "production" }), {
    cookieName: "__Host-arca_session",
    cookieSameSite: "Lax",
    cookieSecure: true,
  });

  const cookie = buildSessionCookie("opaque-token", 12 * 60 * 60);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Path=\//);
  assert.match(cookie, /Max-Age=43200/);
  assert.doesNotMatch(cookie, /Domain=/);
});

test("development cookies default to same-site lax without exposing a domain", () => {
  assert.deepEqual(resolveAuthCookieConfig({ NODE_ENV: "development" }), {
    cookieName: "arca_session",
    cookieSameSite: "Lax",
    cookieSecure: false,
  });
});

test("auth responses prohibit caching and logout cookies expire safely", () => {
  const response = createResponse();
  preventAuthResponseCaching(response);
  assert.equal(response.headers["Cache-Control"], "no-store");
  assert.equal(response.headers.Pragma, "no-cache");

  const expiredCookie = buildExpiredSessionCookie();
  assert.match(expiredCookie, /Max-Age=0/);
  assert.match(expiredCookie, /Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
  assert.doesNotMatch(expiredCookie, /opaque-token/);
});
