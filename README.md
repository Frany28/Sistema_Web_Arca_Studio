# Sistema Web Arca Studio

Sistema web para gestion de proyectos de arquitectura/interiorismo de Arca Studio.

El proyecto esta separado en dos aplicaciones independientes:

- `Frontend/`: SPA en React + Vite.
- `Backend/`: API REST en Node.js + Express.

La documentacion tecnica completa esta en [DOCUMENTACION.md](DOCUMENTACION.md).

## Stack actual

- Frontend: React 19, Vite 8, Tailwind CSS 4, React Router 7, Iconsax, Three.js y Google Model Viewer.
- Backend: Node.js 22, Express 5, PostgreSQL, Supabase Storage compatible con S3, Helmet, CORS y bcrypt.
- Servicios externos: Supabase, Geoapify, Resend, Netlify y Vercel.

## Desarrollo local

Frontend:

```bash
cd Frontend
pnpm install
pnpm run dev
```

Backend:

```bash
cd Backend
pnpm install
pnpm run dev
```

URLs esperadas:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api`

## Scripts principales

Frontend:

- `pnpm run dev`: inicia Vite.
- `pnpm run build`: genera build de produccion.
- `pnpm run lint`: ejecuta ESLint.
- `pnpm run preview`: sirve el build localmente.

Backend:

- `pnpm run dev`: inicia `local.js`.
- `pnpm run start`: inicia `local.js`.
- `pnpm run check:user-login`: revisa login de usuario.
- `pnpm run user:set-status`: cambia estado de usuario.

## Funcionalidades actuales

- Autenticacion, cierre de sesion, recuperacion y cambio de contrasena.
- Rutas protegidas por sesion, rol y permisos.
- Dashboard de clientes.
- Dashboard de arquitectos/administradores.
- Creacion/solicitud de proyectos.
- Detalle de proyecto con informacion, documentos, renders, videos, seguimiento y garantias.
- Comentarios de proyecto con eventos SSE.
- Carga, descarga y eliminacion de archivos.
- Busqueda de direcciones con Geoapify.
- Configuracion de perfil, preferencias, seguridad y soporte.
- Carga de foto de perfil.

## Despliegue

- Frontend: Netlify, configurado en `netlify.toml`.
- Backend: Vercel, configurado en `Backend/vercel.json`.
