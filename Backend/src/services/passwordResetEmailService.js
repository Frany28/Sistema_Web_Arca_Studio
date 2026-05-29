import crypto from "node:crypto";

import { authConfig } from "../config/auth.js";
import { createAuthToken } from "../utils/tokens.js";

const RESET_CODE_LENGTH = 6;
const RESET_TOKEN_EXPIRES_IN_SECONDS = Number(
  process.env.PASSWORD_RESET_EXPIRES_IN_SECONDS || 15 * 60,
);

function getFrontendBaseUrl() {
  const baseUrl =
    process.env.FRONTEND_URL ||
    process.env.PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:5173";

  return String(baseUrl).replace(/\/$/, "");
}

function getMailFrom() {
  return process.env.MAIL_FROM || process.env.RESEND_FROM_EMAIL;
}

function createResetCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(
    RESET_CODE_LENGTH,
    "0",
  );
}

function hashResetCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createPasswordResetPayload(user) {
  const code = createResetCode();
  const token = createAuthToken(
    {
      codeHash: hashResetCode(code),
      email: user.email,
      purpose: "password_reset",
      sub: String(user.id),
    },
    {
      expiresInSeconds: RESET_TOKEN_EXPIRES_IN_SECONDS,
      secret: authConfig.tokenSecret,
    },
  );
  const resetUrl = `${getFrontendBaseUrl()}/nueva-contrasena?token=${encodeURIComponent(token)}`;

  return {
    code,
    expiresInMinutes: Math.ceil(RESET_TOKEN_EXPIRES_IN_SECONDS / 60),
    resetUrl,
  };
}

export async function sendPasswordResetEmail({ code, email, expiresInMinutes, resetUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getMailFrom();

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and MAIL_FROM are required to send email");
  }

  const safeResetUrl = escapeHtml(resetUrl);
  const safeCode = escapeHtml(code);
  const safeEmail = escapeHtml(email);

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Codigo para recuperar tu acceso",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f1f1f; line-height: 1.5;">
          <h1 style="font-size: 22px; margin-bottom: 12px;">Recupera tu acceso</h1>
          <p>Recibimos una solicitud para restablecer la contrasena de ${safeEmail}.</p>
          <p>Tu codigo de verificacion es:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${safeCode}</p>
          <p>Este codigo vence en ${expiresInMinutes} minutos.</p>
          <p>
            <a href="${safeResetUrl}" style="display: inline-block; padding: 12px 18px; background: #ff4438; color: #ffffff; text-decoration: none; border-radius: 8px;">
              Restablecer contrasena
            </a>
          </p>
          <p>Si el boton no funciona, abre este enlace:</p>
          <p><a href="${safeResetUrl}">${safeResetUrl}</a></p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
      text: [
        "Recupera tu acceso",
        `Codigo de verificacion: ${code}`,
        `Este codigo vence en ${expiresInMinutes} minutos.`,
        `Restablecer contrasena: ${resetUrl}`,
        "Si no solicitaste este cambio, puedes ignorar este correo.",
      ].join("\n\n"),
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = data?.message || "Unable to send password reset email";
    throw new Error(message);
  }
}
