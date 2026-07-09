# Frontend - Sistema Web Arca Studio

SPA construida con React, Vite y Tailwind CSS para la experiencia web de clientes, arquitectos y administradores.

## Stack

- React 19.
- React DOM 19.
- Vite 8.
- Tailwind CSS 4 con `@tailwindcss/vite`.
- React Router DOM 7.
- Iconsax React.
- Three.js y `@google/model-viewer` para visualizacion 3D.
- ESLint 9.

## Scripts

```bash
pnpm run dev
pnpm run build
pnpm run lint
pnpm run preview
```

## Estructura principal

```text
src/
  api/          Cliente HTTP centralizado
  assets/       Logos, fondos, iconos e imagenes
  auth/         Contexto y guards de autenticacion
  components/   Componentes reutilizables
  hooks/        Hooks de dominio
  layouts/      Layouts base
  pages/        Vistas principales
  styles/       Estilos globales y tipografia
  utils/        Utilidades de rutas y Geoapify
```

## Rutas principales

- `/`: login, solo para usuarios sin sesion.
- `/cuenta-inactiva`: aviso de cuenta inactiva.
- `/recuperar-cuenta`: solicitud de recuperacion.
- `/nueva-contraseña`: nueva contrasena.
- `/dashboard-clientes`: dashboard de cliente.
- `/dashboard-clientes-vacio`: estado vacio de dashboard de cliente.
- `/dashboard-arquitecto`: dashboard de arquitecto/admin.
- `/dashboard-arquitecto/nuevo-proyecto`: flujo de nuevo proyecto.
- `/dashboard-arquitecto-vacio`: estado vacio de dashboard de arquitecto.
- `/proyectos/:projectId`: detalle de proyecto.
- `/configuraciones`: perfil, preferencias, seguridad y soporte.

Nota: el codigo actual mantiene la ruta con `nueva-contraseña`. Si se normalizan URLs ASCII, actualizar tambien enlaces internos y flujos de recuperacion.

## Variables de entorno

- `VITE_API_URL`: URL base de la API. En desarrollo usa `http://localhost:3000/api` si no se define; en produccion usa `/api`.
- `DEPLOY_BASE_PATH`: base path usada por Vite cuando aplica.

## Desarrollo local

```bash
pnpm install
pnpm run dev
```

La aplicacion queda disponible normalmente en `http://localhost:5173`.
