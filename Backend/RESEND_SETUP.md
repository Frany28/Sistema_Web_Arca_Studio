# Integración con Resend (envío de correos)

Este proyecto ya incluye un servicio de envío de correos usando la API de Resend en `src/services/passwordResetEmailService.js`.

Variables de entorno necesarias

- `RESEND_API_KEY` : Tu API Key privada de Resend (empieza por `re_...`).
- `MAIL_FROM` : Dirección "From" que se usará en los correos. Formato recomendado: `ARCA Studio <no-reply@tudominio.com>`.

Variables opcionales

- `RESEND_FROM_EMAIL` : Alias alternativo para `MAIL_FROM` (si tu despliegue prefiere este nombre).

Dónde añadirlas

- En desarrollo: añade las variables en `Backend/.env` (no comites este archivo).
- En producción: añade `RESEND_API_KEY` y `MAIL_FROM` en los secrets/env vars de tu host (Vercel, Netlify, etc.).

Pasos rápidos para obtener la API key

1. Crea una cuenta en https://resend.com/ (si no tienes una).
2. Ve a la sección de API keys en el dashboard.
3. Genera una nueva API key de solo servidor y cópiala.
4. Pega esa clave en `RESEND_API_KEY` en tu `.env` o en los secrets del host.

Recomendaciones de seguridad y deliverability

- Verifica tu dominio en Resend para mejorar entrega (SPF/DKIM). Sigue las instrucciones del dashboard de Resend para agregar los registros DNS.
- Si aún no puedes verificar tu dominio propio, usa temporalmente el remitente de prueba `ARCA Studio <onboarding@resend.dev>`.
- No guardes `RESEND_API_KEY` en el control de versiones.

Comando `curl` para probar la API (reemplaza `REPLACE_API_KEY` y emails):

```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer REPLACE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "ARCA Studio <no-reply@tudominio.com>",
    "to": ["tu@dominio.com"],
    "subject": "Prueba desde Resend",
    "text": "Este es un correo de prueba desde Resend"
  }'
```

Comprobación rápida en Node (Node 18+ / Node 22 tiene `fetch` global):

```js
const apiKey = process.env.RESEND_API_KEY || "REPLACE_API_KEY";

async function sendTestEmail() {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ARCA Studio <no-reply@tudominio.com>",
      to: ["tu@dominio.com"],
      subject: "Prueba Resend desde Node",
      text: "Hola — este es un test.",
    }),
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}

sendTestEmail().catch(console.error);
```

Dónde se usa en este repo

- `Backend/src/services/passwordResetEmailService.js` — función `sendPasswordResetEmail` ya utiliza la variable `RESEND_API_KEY` y `MAIL_FROM`.

Si quieres, puedo:

- Añadir pruebas automáticas de envío (sandbox) o una ruta de "send-test-email" para verificar que la integración funciona.
- Añadir validación al arranque que falle con error claro si `RESEND_API_KEY` no está presente en entornos de producción.

Dime si quieres que añada alguna de estas mejoras ahora.
