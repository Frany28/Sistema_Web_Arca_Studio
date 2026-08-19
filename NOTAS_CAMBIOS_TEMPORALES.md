# Cambios temporales para pruebas

## Catalogo publico de Input Tags

La ruta `/componentes/input-tags` expone temporalmente en localhost y en los
despliegues de staging/demo una matriz visual y un ejemplo interactivo del
componente `Input` con `type="Tags"`.

Esta ruta no requiere autenticacion para facilitar la comparacion con Figma.
Debe eliminarse del router antes de declarar un despliegue como produccion.

## Rutas publicas sin autenticacion

Se desactivo temporalmente la proteccion de rutas para hacer pruebas sin login.
No se elimino la logica existente; solo quedo inactiva mediante un switch.

### Frontend

Archivo principal:

- `Frontend/src/auth/testAccess.js`

Switch actual:

```js
export const ROUTE_AUTH_DISABLED_FOR_TESTS = true;
```

Tambien se ajustaron estos archivos para respetar ese switch:

- `Frontend/src/auth/AuthContext.jsx`
- `Frontend/src/auth/ProtectedRoute.jsx`
- `Frontend/src/auth/PublicOnlyRoute.jsx`

### Backend

Archivo principal:

- `Backend/src/middlewares/auth.js`

Switch actual:

```js
const ROUTE_AUTH_DISABLED_FOR_TESTS = true;
```

Mientras el switch esta activo, `requireAuth`, `requireRoles` y
`requirePermissions` permiten pasar sin token y usan un usuario de prueba.

### Como reactivar autenticacion

Cambiar ambos switches a `false`:

- `Frontend/src/auth/testAccess.js`
- `Backend/src/middlewares/auth.js`

```js
ROUTE_AUTH_DISABLED_FOR_TESTS = false;
```

Despues de eso, las rutas vuelven a requerir sesion, roles y permisos como antes.
