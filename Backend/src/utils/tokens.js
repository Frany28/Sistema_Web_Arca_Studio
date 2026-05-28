import crypto from "node:crypto";

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function signTokenPart(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAuthToken(payload, { expiresInSeconds, secret }) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const claims = {
    ...payload,
    exp: now + expiresInSeconds,
    iat: now,
  };

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claims)}`;
  const signature = signTokenPart(unsignedToken, secret);

  return `${unsignedToken}.${signature}`;
}

export function verifyAuthToken(token, { secret }) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signTokenPart(unsignedToken, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  const header = base64UrlDecode(encodedHeader);

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    return null;
  }

  const payload = base64UrlDecode(encodedPayload);
  const now = Math.floor(Date.now() / 1000);

  if (!payload.exp || payload.exp <= now) {
    return null;
  }

  return payload;
}
