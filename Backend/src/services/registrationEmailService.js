import crypto from "node:crypto";

import { authConfig } from "../config/auth.js";
import { createAuthToken } from "../utils/tokens.js";

const EXPIRES_IN_SECONDS = 15 * 60;

function frontendUrl() {
  return String(process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL || process.env.APP_URL || "https://arcastudio.netlify.app").replace(/\/$/, "");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function emailError(message, code, status = 502) {
  return Object.assign(new Error(message), {
    code,
    publicMessage: "No pudimos enviar el correo de verificación.",
    status,
  });
}

export function hashRegistrationToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createRegistrationEmailPayload(email) {
  const token = createAuthToken(
    { email, purpose: "user_registration" },
    { expiresInSeconds: EXPIRES_IN_SECONDS, secret: authConfig.tokenSecret },
  );
  return {
    token,
    tokenHash: hashRegistrationToken(token),
    expiresAt: new Date(Date.now() + EXPIRES_IN_SECONDS * 1000).toISOString(),
    registrationUrl: `${frontendUrl()}/crear-contrasena?token=${encodeURIComponent(token)}`,
  };
}

export async function sendRegistrationEmail({ email, registrationUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw emailError("RESEND_API_KEY and MAIL_FROM are required", "EMAIL_SERVICE_NOT_CONFIGURED", 503);
  const safeUrl = escapeHtml(registrationUrl);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Verifica tu correo electrónico",
      html: `<div style="font-family:Arial,sans-serif;color:#2a2929;line-height:1.5"><h1>Verifica tu correo electrónico</h1><p>Confirma tu correo para terminar de crear tu cuenta en ARCA Studio.</p><p><a href="${safeUrl}" style="display:inline-block;padding:12px 18px;background:#ff4438;color:#fff;text-decoration:none;border-radius:8px">Verificar correo</a></p><p>Este enlace vencerá en 15 minutos y solo puede utilizarse una vez.</p><p>Si el botón no funciona, abre este enlace: <a href="${safeUrl}">${safeUrl}</a></p></div>`,
      text: `Verifica tu correo para crear tu cuenta en ARCA Studio: ${registrationUrl}\n\nEste enlace vencerá en 15 minutos.`,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw emailError(data?.message || "Unable to send registration email", "EMAIL_DELIVERY_FAILED");
  }
}
