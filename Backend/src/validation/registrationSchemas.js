import { z } from "zod";

export function normalizeRegistrationPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("58")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.length === 10 ? `+58${digits}` : "";
}

const email = z.string().trim().pipe(z.email("Correo inválido.")).transform((value) => value.toLowerCase());
const fullName = z.string().trim().min(3).max(300).transform((value, context) => {
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    context.addIssue({ code: "custom", message: "Ingresa nombre y apellido." });
    return z.NEVER;
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
});
const phone = z.string().transform((value, context) => {
  const normalized = normalizeRegistrationPhone(value);
  if (!normalized) {
    context.addIssue({ code: "custom", message: "Número de teléfono inválido." });
    return z.NEVER;
  }
  return normalized;
});
const password = z.string().min(8).max(256).refine(
  (value) => /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value),
  "La contraseña debe incluir una mayúscula, un número y un carácter especial.",
);

export const startRegistrationSchema = z.object({
  body: z.object({
    fullName,
    email,
    phone,
    company: z.string().trim().max(150).optional().transform((value) => value || null),
    referralSource: z.enum(["instagram", "referred", "whatsapp", "other"]),
  }),
});

export const resendRegistrationSchema = z.object({ body: z.object({ email }) });
export const verifyRegistrationSchema = z.object({ body: z.object({ token: z.string().trim().min(1).max(2000) }) });
export const completeRegistrationSchema = z.object({
  body: z.object({
    token: z.string().trim().min(1).max(2000),
    password,
    passwordConfirmation: z.string().min(1).max(256),
  }).refine((body) => body.password === body.passwordConfirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirmation"],
  }),
});
