# Documentación del proyecto - Sistema Web Arca Studio

Documento generado a partir del estado actual del repositorio.

## 1. Resumen general

Sistema Web Arca Studio es una aplicación web para la gestión de proyectos de arquitectura/interiorismo. El sistema separa la experiencia de cliente y arquitecto/administrador, con autenticación, dashboards, detalle de proyectos, gestión de solicitudes, archivos, comentarios, renders, seguimiento, garantías y configuraciones de usuario.

El repositorio está organizado como una aplicación con frontend y backend independientes:

```text
Sistema_Web_Arca_Studio/
  Frontend/   Aplicación React + Vite
  Backend/    API Node.js + Express
  netlify.toml
```

## 2. Arquitectura general

### Frontend

Aplicación SPA construida con React, Vite y Tailwind CSS. Usa React Router para controlar rutas públicas, rutas protegidas y rutas por rol.

Responsabilidades principales:

- Login, recuperación y cambio de contraseña.
- Dashboard para clientes.
- Dashboard para arquitectos y administradores.
- Vista de detalle de proyecto.
- Paneles de documentos, renders, seguimiento, información general y garantías.
- Componentes UI reutilizables.
- Consumo de API REST del backend.
- Manejo de token de autenticación en memoria, sessionStorage y localStorage.
- Sincronización de tema visual.

### Backend

API en Node.js con Express. Expone endpoints REST para autenticación, proyectos, solicitudes de proyecto, archivos, permisos, roles, comentarios y Geoapify.

Responsabilidades principales:

- Autenticación y sesión.
- Autorización por roles y permisos.
- Rate limit para acciones sensibles de autenticación.
- Conexión a PostgreSQL.
- Acceso a Supabase Storage compatible con S3.
- Upload, descarga y eliminación de archivos.
- Comentarios de proyecto.
- Eventos server-sent events para comentarios.
- Recuperación de contraseña vía Resend.
- Proxy seguro para búsqueda de direcciones con Geoapify.
- Seguridad HTTP con Helmet, CORS y validación de origen confiable.

## 3. Stack técnico

### Lenguaje y runtime

- JavaScript moderno con ES Modules.
- Node.js 22.x en backend.
- React JSX en frontend.

### Frontend

- React 19.
- React DOM 19.
- Vite 8.
- Tailwind CSS 4 mediante plugin oficial de Vite.
- React Router DOM 7.
- ESLint 9.
- Iconsax React.
- Google Model Viewer para visualización 3D.

### Backend

- Express 5.
- PostgreSQL mediante `pg`.
- Supabase JS.
- Supabase Storage vía API S3 compatible.
- AWS SDK S3 Client.
- bcrypt para hashing de contraseñas.
- cors para politica CORS.
- helmet para cabeceras de seguridad.
- dotenv para variables de entorno locales.

### Servicios externos

- Supabase:
  - Base de datos PostgreSQL.
  - Storage compatible con S3.
- Geoapify:
  - Autocomplete y reverse geocoding para direcciones.
- Resend:
  - Envío de correos de recuperación de contraseña.
- Netlify:
  - Despliegue del frontend.
- Vercel:
  - Despliegue del backend serverless.

## 4. Dependencias

### Frontend - dependencias de producción

| Paquete | Version actual en package.json | Uso principal |
| --- | --- | --- |
| `@google/model-viewer` | `^4.3.1` | Visualización de modelos 3D en navegador |
| `class-variance-authority` | `^0.7.1` | Variantes de componentes UI |
| `clsx` | `^2.1.1` | Composicion condicional de clases CSS |
| `iconsax-react` | `^0.0.8` | Iconografia React |
| `react` | `^19.2.4` | Framework UI |
| `react-country-flag` | `^3.1.0` | Banderas de paises |
| `react-dom` | `^19.2.4` | Renderizado React en DOM |
| `react-router-dom` | `^7.13.2` | Ruteo SPA |

### Frontend - dependencias de desarrollo

| Paquete | Version actual en package.json | Uso principal |
| --- | --- | --- |
| `@eslint/js` | `^9.39.4` | Reglas base de ESLint |
| `@tailwindcss/vite` | `^4.2.2` | Integracion Tailwind + Vite |
| `@types/react` | `^19.2.14` | Tipos React |
| `@types/react-dom` | `^19.2.3` | Tipos React DOM |
| `@vitejs/plugin-react` | `^6.0.1` | Plugin React para Vite |
| `esbuild` | `^0.27.4` | Minificacion/build |
| `eslint` | `^9.39.4` | Linting |
| `eslint-plugin-react-hooks` | `^7.0.1` | Reglas para hooks |
| `eslint-plugin-react-refresh` | `^0.5.2` | Reglas para React Refresh |
| `globals` | `^17.4.0` | Globales para ESLint |
| `tailwindcss` | `^4.2.2` | Framework CSS |
| `vite` | `^8.0.1` | Bundler/dev server |

### Backend - dependencias de producción

| Paquete | Version actual en package.json | Uso principal |
| --- | --- | --- |
| `@aws-sdk/client-s3` | `^3.1068.0` | Cliente S3 para Supabase Storage |
| `@supabase/supabase-js` | `^2.49.4` | Cliente Supabase |
| `bcrypt` | `^6.0.0` | Hash y verificación de contraseñas |
| `cors` | `^2.8.6` | Configuración CORS |
| `dotenv` | `^17.4.2` | Variables de entorno locales |
| `express` | `^5.2.1` | Framework HTTP backend |
| `helmet` | `^8.2.0` | Cabeceras de seguridad |
| `pg` | `^8.21.0` | Cliente PostgreSQL |

## 5. Scripts disponibles

### Frontend

Ubicación: `Frontend/package.json`

```bash
pnpm run dev
pnpm run build
pnpm run lint
pnpm run preview
```

Scripts:

- `dev`: inicia Vite con `--host`.
- `build`: genera build de producción.
- `lint`: ejecuta ESLint sobre el frontend.
- `preview`: sirve localmente el build.

### Backend

Ubicación: `Backend/package.json`

```bash
pnpm run dev
pnpm run start
pnpm run check:user-login
pnpm run user:set-status
```

Scripts:

- `dev`: inicia `local.js`.
- `start`: inicia `local.js`.
- `check:user-login`: ejecuta script de revisión de login de usuario.
- `user:set-status`: cambia estado de usuario.

El backend también incluye scripts operativos en `Backend/scripts/` para inspección de esquema, permisos, autenticación, usuarios, proyectos, carga de imágenes/modelos y preparación de tablas/campos.

## 6. Estructura del frontend

```text
Frontend/
  public/
  src/
    api/
    assets/
    auth/
    components/
    hooks/
    layouts/
    pages/
    styles/
    utils/
    main.jsx
    index.css
    theme-init.js
  vite.config.js
  eslint.config.js
  package.json
```

### Rutas principales

Definidas en `Frontend/src/main.jsx`.

| Ruta | Acceso | Vista |
| --- | --- | --- |
| `/` | Pública solo sin sesión | Login |
| `/cuenta-inactiva` | Pública | Cuenta inactiva |
| `/recuperar-cuenta` | Pública | Recuperación de cuenta |
| `/nueva-contraseña` | Pública | Nueva contraseña |
| `/dashboard-clientes` | Rol `client` | Dashboard cliente |
| `/dashboard-clientes-vacio` | Rol `client` | Estado vacio de proyectos |
| `/dashboard-arquitecto` | Rol `admin` o `architect` | Dashboard arquitecto |
| `/dashboard-arquitecto/nuevo-proyecto` | Rol `admin` o `architect` | Nuevo proyecto |
| `/dashboard-arquitecto-vacio` | Rol `admin` o `architect` | Estado vacio |
| `/proyectos/:projectId` | Usuario autenticado | Detalle de proyecto |
| `/configuraciones` | Usuario autenticado | Configuraciones |

Nota: en código existe la ruta `/nueva-contraseña` con carácter especial. Si se requiere compatibilidad ASCII o URLs sin acentos, conviene revisar esta ruta.

### Módulos relevantes

- `src/api/http.js`: cliente HTTP centralizado.
- `src/auth/AuthContext.jsx`: contexto de autenticación.
- `src/auth/ProtectedRoute.jsx`: protección de rutas autenticadas y por rol.
- `src/auth/PublicOnlyRoute.jsx`: evita que usuarios autenticados entren a rutas públicas como login.
- `src/pages/`: vistas principales del producto.
- `src/components/ui/`: biblioteca local de componentes UI.
- `src/utils/geoapify.js`: búsqueda de direcciones vía backend.
- `src/pages/projects/`: vistas y paneles de detalle de proyectos.
- `src/pages/architect-dashboard/`: dashboard y flujo de creación para arquitectos.
- `src/pages/settings/`: configuración de perfil, preferencias, seguridad y soporte.

## 7. Estructura del backend

```text
Backend/
  api/
    index.js
  scripts/
  src/
    config/
    controllers/
    middlewares/
    repositories/
    routes/
    services/
    utils/
    app.js
  local.js
  vercel.json
  package.json
```

### Capas del backend

- `src/app.js`: crea y configura la aplicación Express.
- `src/routes/`: define rutas HTTP.
- `src/controllers/`: maneja requests/responses.
- `src/repositories/`: encapsula consultas de datos.
- `src/middlewares/`: autenticación, origen confiable y rate limit.
- `src/services/`: servicios de dominio, eventos y correo.
- `src/config/`: CORS, base de datos, auth y storage.
- `src/utils/`: tokens y cookies.

### Middlewares globales

El backend aplica:

- `helmet()`.
- `cors(corsOptions())`.
- `express.json({ limit: "100kb" })`.
- `loadSession`.
- `requireTrustedOrigin`.

## 8. API backend

Base local esperada:

```text
http://localhost:3000/api
```

### Salud

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado basico de la API |
| GET | `/api/health/database` | Verifica conexión PostgreSQL |

### Autenticación

Base: `/api/auth`

| Método | Endpoint | Protección | Descripción |
| --- | --- | --- | --- |
| POST | `/login` | Rate limit | Login |
| POST | `/forgot-password` | Rate limit | Solicita recuperación de contraseña |
| POST | `/verify-reset-token` | Rate limit | Verifica token de recuperación |
| POST | `/reset-password` | Rate limit | Restablece contraseña |
| POST | `/change-password` | Auth + rate limit | Cambia contraseña del usuario autenticado |
| GET | `/me` | Auth | Devuelve usuario actual |
| POST | `/logout` | Pública | Cierra sesión |

### Administración

Base: `/api/admin`

Requiere usuario autenticado con rol `admin`.

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/roles` | Lista roles |
| GET | `/permissions` | Lista permisos |
| GET | `/roles-permissions` | Matriz de roles/permisos |
| GET | `/roles/:roleCode/permissions` | Permisos de un rol |
| PUT | `/roles/:roleCode/permissions` | Actualiza permisos de un rol |

### Proyectos

Base: `/api/projects`

| Método | Endpoint | Protección | Descripción |
| --- | --- | --- | --- |
| GET | `/` | Auth + `projects.read` | Lista proyectos accesibles |
| GET | `/:projectId` | Auth + `projects.read` | Detalle de proyecto |
| GET | `/:projectId/comments` | Auth | Lista comentarios del proyecto |
| GET | `/:projectId/events` | Auth | Stream SSE de eventos de comentarios |
| POST | `/:projectId/comments` | Auth | Crea comentario |
| GET | `/:projectId/files/:fileId/content` | Auth + `projects.read` | Descarga/stream de archivo |
| PATCH | `/:projectId/publication` | Auth + `projects.publish` | Actualiza publicacion del proyecto |

### Solicitudes de proyecto

Base: `/api/project-requests`

| Método | Endpoint | Protección | Descripción |
| --- | --- | --- | --- |
| POST | `/` | Auth | Crea solicitud de proyecto |
| PATCH | `/:projectRequestId` | Auth | Actualiza solicitud |
| POST | `/:projectRequestId/files` | Auth | Sube archivo asociado |
| DELETE | `/:projectRequestId/files/:fileId` | Auth | Elimina archivo asociado |

La subida de archivos usa `express.raw` con limite configurable por `FILE_UPLOAD_LIMIT`, por defecto `50mb`.

### Geoapify

Base: `/api/geoapify`

| Método | Endpoint | Protección | Descripción |
| --- | --- | --- | --- |
| GET | `/address-suggestións?q=...` | Auth | Obtiene sugerencias de dirección |

## 9. Autenticación y autorización

El sistema usa:

- Token propio generado por backend.
- Cookie de sesión configurable.
- Header `Authorization: Bearer <token>`.
- Persistencia frontend en memoria, `sessionStorage` y `localStorage`.
- Broadcast de logout entre pestanas usando `localStorage`.
- Roles detectados: `client`, `architect`, `admin`.
- Permisos revisados en backend, por ejemplo `projects.read` y `projects.publish`.

Configuración principal:

- `AUTH_TOKEN_SECRET`.
- `AUTH_COOKIE_NAME`.
- `AUTH_COOKIE_SAMESITE`.
- `AUTH_COOKIE_SECURE`.
- `AUTH_TOKEN_EXPIRES_IN_SECONDS`.
- `AUTH_LOGIN_RATE_LIMIT_MAX`.
- `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS`.

En producción, `AUTH_TOKEN_SECRET` es obligatorio.

## 10. Variables de entorno

### Frontend

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | No | URL base de la API. En desarrollo usa `http://localhost:3000/api`; en producción usa `/api` |
| `DEPLOY_BASE_PATH` | No | Base path para Vite segun `vite.config.js` |

### Backend - servidor

| Variable | Requerida | Default | Descripción |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Puerto local |
| `NODE_ENV` | No | - | Define comportamiento de producción |
| `FILE_UPLOAD_LIMIT` | No | `50mb` | Limite para uploads raw |

### Backend - base de datos

| Variable | Requerida | Default | Descripción |
| --- | --- | --- | --- |
| `DATABASE_URL` | Si | - | Connection string PostgreSQL |
| `DATABASE_SSL` | No | `true` | Activa SSL si no es base local |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | No | `false` | Valida certificado SSL |
| `DATABASE_SSL_CA_CERT` | No | - | Certificado CA |
| `DATABASE_POOL_MAX` | No | `10` | Maximo de conexiónes |
| `DATABASE_IDLE_TIMEOUT_MS` | No | `30000` | Timeout idle |
| `DATABASE_CONNECTION_TIMEOUT_MS` | No | `5000` | Timeout de conexión |

### Backend - CORS

| Variable | Requerida | Default | Descripción |
| --- | --- | --- | --- |
| `CORS_ORIGIN` / `CORS_ORIGINS` | No | `http://localhost:5173` | Origenes permitidos separados por coma |
| `CORS_ALLOWED_HEADERS` | No | Headers base | Headers adicionales permitidos |
| `CORS_ALLOW_NO_ORIGIN` | No | `true` en dev, `false` en prod | Permite requests sin origin |
| `CORS_CREDENTIALS` | No | `true` | Permite credenciales |

### Backend - auth

| Variable | Requerida | Default | Descripción |
| --- | --- | --- | --- |
| `AUTH_TOKEN_SECRET` | Sí en producción | Aleatorio en dev | Secreto para tokens |
| `AUTH_COOKIE_NAME` | No | `__Host-arca_session` en prod, `arca_session` en dev | Nombre cookie |
| `AUTH_COOKIE_SAMESITE` | No | `None` en prod, `Lax` en dev | SameSite cookie |
| `AUTH_COOKIE_SECURE` | No | Segun `NODE_ENV` | Cookie segura |
| `AUTH_LOGIN_RATE_LIMIT_MAX` | No | `5` | Intentos maximos |
| `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS` | No | `900000` | Ventana rate limit |
| `AUTH_TOKEN_EXPIRES_IN_SECONDS` | No | `43200` | Duración token |

### Backend - Supabase Storage S3

| Variable | Requerida | Default | Descripción |
| --- | --- | --- | --- |
| `SUPABASE_STORAGE_S3_ACCESS_KEY_ID` | Si | - | Access key S3 |
| `SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY` | Si | - | Secret key S3 |
| `SUPABASE_STORAGE_S3_ENDPOINT` | Si | - | Endpoint S3 |
| `SUPABASE_STORAGE_S3_REGION` | No | `us-east-1` | Region |
| `SUPABASE_STORAGE_BUCKET` | Segun operacion | `null` | Bucket de storage |
| `SUPABASE_URL` | No | - | URL publica para construir links de archivos |

### Backend - Geoapify

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `GEOAPIFY_API_KEY` | Sí para búsqueda de direcciones | API key del servicio |
| `VITE_GEOAPIFY_API_KEY` | Alternativa backend actual | Fallback usado por el backend |

### Backend - Resend y recuperación de contraseña

| Variable | Requerida | Default | Descripción |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | Sí para enviar correos | - | API key de Resend |
| `MAIL_FROM` | Sí para enviar correos | - | Remitente |
| `RESEND_FROM_EMAIL` | Alternativa | - | Remitente fallback |
| `PASSWORD_RESET_EXPIRES_IN_SECONDS` | No | `900` | Duración del enlace |
| `FRONTEND_URL` | No | `https://arcastudio.netlify.app` | Base URL para link de reset |
| `PUBLIC_APP_URL` | Alternativa | - | Fallback base URL |
| `APP_URL` | Alternativa | - | Fallback base URL |

### Backend - scripts

| Variable | Uso |
| --- | --- |
| `TEST_USER_EMAIL` | Script `upsert-test-user.mjs` |
| `TEST_USER_PASSWORD` | Script `upsert-test-user.mjs` |

## 11. Base de datos y modelo inferido

El repositorio no incluye migraciones SQL formales en la raiz visible, pero los repositorios y scripts sugieren las siguientes areas de datos:

- Usuarios.
- Roles.
- Permisos.
- Matriz rol-permiso.
- Proyectos.
- Detalle de proyectos.
- Solicitudes de proyecto.
- Comentarios de proyecto.
- Archivos y versiones de archivo.
- Tokens o registros de recuperación de contraseña.
- Visibilidad/publicacion de proyectos.
- Coordenadas/ubicación de proyectos.

Los scripts en `Backend/scripts/` permiten inspecciónar y preparar partes del esquema:

- `inspect-schema.mjs`.
- `inspect-auth.mjs`.
- `inspect-roles-permissions.mjs`.
- `inspect-projects-schema.mjs`.
- `ensure-project-detail-tables.mjs`.
- `ensure-project-location-coordinates.mjs`.
- `ensure-project-publication.mjs`.
- `create-password-reset-table.mjs`.
- `seed-project-visibility-examples.mjs`.

## 12. Archivos y storage

La gestión de archivos se apoya en Supabase Storage mediante compatibilidad S3.

Funciones actuales:

- Sanitizacion de nombres de archivo.
- Construccion de claves de storage por entidad, usuario, fecha, archivo y version.
- Upload de archivos a solicitudes de proyecto.
- Eliminación de adjuntos.
- Stream/descarga de archivos asociados a proyectos.
- Soporte para URL publica si `SUPABASE_URL` y `SUPABASE_STORAGE_BUCKET` estan configurados.

Patron de key de storage:

```text
{belongsTo}/{parentId}/users/{ownerId}/{year}/{month}/files/{fileId}/v{versionNumber}/{safeName}
```

## 13. Seguridad

Medidas implementadas:

- `helmet` para cabeceras HTTP.
- CORS con lista configurable de origenes.
- Validación de origen confiable.
- Cookies configurables para producción.
- Tokens con expiracion.
- Rate limit en login y recuperación/cambio de contraseña.
- Restricción de rutas por autenticación, rol y permisos.
- CSP configurado en `netlify.toml`.
- `X-Frame-Options: DENY`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` restrictiva.

## 14. Despliegue

### Frontend - Netlify

Configuración en `netlify.toml`:

```toml
[build]
  base = "Frontend"
  command = "pnpm run build"
  publish = "dist"
```

Incluye redirect SPA:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Tambien define cabeceras de seguridad y CSP para fuentes, imágenes, conexiónes y frames permitidos.

### Backend - Vercel

Configuración en `Backend/vercel.json`:

```json
{
  "installCommand": "pnpm install",
  "buildCommand": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

El entrypoint serverless es:

```text
Backend/api/index.js
```

Para desarrollo local:

```text
Backend/local.js
```

## 15. Convenciones de UI y producto observadas

- Componentes reutilizables agrupados en `src/components/ui/`.
- Muchos componentes incluyen archivos `Config` y `ShowcaseData`, lo que sugiere una biblioteca interna de UI/documentación visual.
- Manejo de estados vacios para dashboards y secciones de proyecto.
- Layouts separados para autenticación y aplicación principal.
- Soporte de tema con `ThemeSync` y utilidades de preferencias.
- Uso de assets propios para logos, fondos, iconos, archivos y estados vacios.

## 16. Estado funcional actual

Funcionalidades visibles en código:

- Inicio de sesión.
- Cierre de sesión.
- Recuperación de contraseña por correo.
- Validación y restablecimiento de contraseña.
- Cambio de contraseña desde configuraciones.
- Rutas protegidas por autenticación.
- Rutas protegidas por rol.
- Dashboard cliente.
- Dashboard arquitecto/admin.
- Creación o solicitud de nuevo proyecto.
- Búsqueda de dirección mediante Geoapify.
- Listado y detalle de proyectos.
- Públicacion/visibilidad de proyectos.
- Comentarios en proyectos.
- Eventos en tiempo real para comentarios vía SSE.
- Carga y eliminación de archivos en solicitudes.
- Lectura/stream de archivos de proyecto.
- Paneles de detalle de proyecto: información, documentos, renders, seguimiento y garantías.
- Configuración de perfil, preferencias, seguridad y soporte.

## 17. Observaciones técnicas

- Gestor de paquetes oficial: pnpm `10.18.2` para Frontend y Backend.
- El Frontend y el Backend mantienen lockfiles pnpm independientes, sin workspace raíz por ahora.
- Se revisaron los textos localizados con español visible y se normalizaron acentos en documentación, README y mensajes de usuario.
- La documentación de base de datos depende del código y scripts porque no se observaron migraciones SQL versionadas en la estructura listada.
- `AUTH_TOKEN_SECRET` debe estar definido en producción para evitar error de arranque.
- `DATABASE_URL` es obligatoria siempre.
- Para que el envío de recuperación funcione deben estar configurados `RESEND_API_KEY` y `MAIL_FROM` o `RESEND_FROM_EMAIL`.

## 18. Comandos recomendados para desarrollo

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

URLs locales esperadas:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api
```

## 19. Checklist para continuidad

- Agregar archivo `.env.example` para frontend y backend.
- Versionar migraciones o scripts SQL de base de datos.
- Documentar modelos/tablas con columnas reales desde la base de datos.
- Agregar pruebas automáticas para autenticación, permisos y flujos críticos.
- Documentar flujos de despliegue por ambiente.
- Definir convenciones de componentes UI y tokens de diseño.
