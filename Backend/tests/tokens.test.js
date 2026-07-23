import assert from "node:assert/strict";
import test from "node:test";

import { createAuthToken, verifyAuthToken } from "../src/utils/tokens.js";

const secret = "test-secret-with-sufficient-entropy";

test("auth tokens require a valid signature and expiration", () => {
  const token = createAuthToken(
    { sub: "7" },
    { expiresInSeconds: 60, secret },
  );

  assert.equal(verifyAuthToken(token, { secret })?.sub, "7");
  assert.equal(verifyAuthToken(token, { secret: `${secret}-wrong` }), null);
});

test("auth tokens reject malformed JOSE headers", () => {
  const token = createAuthToken(
    { sub: "7" },
    { expiresInSeconds: 60, secret },
  );
  const [, payload, signature] = token.split(".");
  const invalidHeader = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");

  assert.equal(
    verifyAuthToken(`${invalidHeader}.${payload}.${signature}`, { secret }),
    null,
  );
});
