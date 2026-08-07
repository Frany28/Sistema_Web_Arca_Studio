# Reglas de desarrollo — Sistema Web ARCA Studio

Estas instrucciones son obligatorias para cualquier persona o agente que modifique este repositorio.

## Principios

- Preservar la arquitectura modular existente; no introducir microservicios, Redis, MinIO, TypeScript ni cambios de proveedor sin autorización explícita.
- Reutilizar módulos existentes antes de crear lógica nueva.
- No mezclar cambios funcionales con correcciones de lint o refactors ajenos.
- Conservar compatibilidad con endpoints y respuestas exitosas existentes salvo que el cambio esté explícitamente autorizado.
- Nunca incluir credenciales, tokens, URLs privadas ni contenido de `.env` en código, documentación, logs o respuestas.

## Arquitectura obligatoria del backend

```text
route → middleware/validation → controller → service → repository/adapter
```

- `routes`: declarar endpoints y encadenar autenticación, permisos, límites y validación.
- `controllers`: traducir HTTP; no contener SQL ni llamadas directas al almacenamiento.
- `services`: aplicar reglas y coordinar repositorios/adaptadores.
- `repositories`: realizar exclusivamente operaciones PostgreSQL mediante consultas parametrizadas.
- `validation`: definir esquemas Zod reutilizables.
- `errors`: utilizar errores de aplicación y el middleware central.
- `objectStorage`: único punto autorizado para comunicarse con almacenamiento S3-compatible.
- `prisma/migrations`: única fuente autorizada para cambios de estructura PostgreSQL.

Consultar `Sistema_Web_Arca_Studio/Backend/ARCHITECTURE.md` antes de crear módulos o endpoints.

## Arquitectura y diseño obligatorios del frontend

- Consultar `Sistema_Web_Arca_Studio/Frontend/DESIGN_SYSTEM.md` antes de crear o modificar páginas, componentes visuales o estilos.
- Reutilizar `Frontend/src/components/ui` y extender sus variantes antes de crear componentes equivalentes.
- Usar los tokens de `Frontend/src/styles/global.css` y las clases de `Frontend/src/styles/typography.css`; evitar valores visuales duplicados.
- Mantener todas las vistas responsive, accesibles y compatibles con tema claro y oscuro.
- Diseñar explícitamente los estados de carga, contenido, vacío, error y paginación.
- Centralizar los patrones que se repitan y mantener la coordinación de datos fuera de los componentes visuales base.

## Reutilización obligatoria

Antes de implementar lógica nueva, revisar:

- `src/middlewares/validate.js` y `src/validation/` para entradas externas.
- `src/errors/appError.js` para errores HTTP.
- `src/services/fileUploadService.js` para uploads.
- `src/services/objectStorage.js` para almacenamiento.
- `src/utils/pagination.js` para colecciones.
- `src/middlewares/rateLimit.js` para límites.
- `src/middlewares/auth.js` para autenticación y permisos.
- `src/config/db.js` para PostgreSQL.
- `src/services/projectEvents.js` para eventos en tiempo real.

Si una regla se utiliza en dos sitios, extraerla a un módulo compartido en lugar de copiarla.

## Caché obligatorio

- Toda lectura repetible o recurso reutilizable debe evaluar y aplicar caché cuando sea técnicamente seguro, con el objetivo de reducir latencia, consultas a PostgreSQL, solicitudes al backend y descargas duplicadas.
- Panorámicas, imágenes, videos y demás archivos inmutables deben usar URLs versionadas y caché privado de larga duración. Una nueva versión debe producir una clave distinta e invalidar de forma natural el contenido anterior.
- Las peticiones concurrentes equivalentes deben deduplicarse y compartir la misma promesa o carga en curso. Los resultados reutilizables dentro de la sesión deben conservarse en un módulo compartido, no en implementaciones duplicadas por componente.
- Todo caché debe definir explícitamente su clave, alcance, duración, límite de memoria o almacenamiento e invalidación. No se permite un caché sin estrategia para cambios, eliminaciones o nuevas versiones.
- Los recursos protegidos deben aislarse por usuario o sesión y usar `Cache-Control: private`. Nunca se debe compartir contenido autenticado entre usuarios, roles o proyectos sin comprobar sus permisos.
- No almacenar en caché respuestas de autenticación, datos sensibles no versionados, mutaciones, errores ni respuestas incompletas. Ante duda de seguridad o consistencia, priorizar la fuente de verdad y documentar por qué no se usa caché.
- Cada implementación de caché debe cubrir con pruebas el acierto, el fallo, la deduplicación cuando corresponda y la invalidación por versión, usuario o cambio de contexto.

## Reglas de API y datos

- Regla estricta de seguridad: ninguna respuesta JSON, evento SSE, log o metadato público puede exponer URLs de almacenamiento, URLs firmadas, claves de objeto ni rutas protegidas de archivos o avatares.
- Los recursos protegidos se representan exclusivamente mediante identificadores, versión, tipo y banderas como `hasImage` o `hasProfilePhoto`. El frontend debe construir la ruta autenticada mediante el cliente API central.
- Toda URL se elimina de las respuestas públicas por defecto. Una excepción de negocio debe declararse explícitamente en la lista permitida del saneador, validarse como entrada externa y contar con una prueba de regresión. Actualmente la única excepción autorizada es `referenceLink`.
- Queda prohibido agregar a contratos públicos campos como `src`, `href`, `uri`, `fileUrl`, `downloadUrl`, `signedUrl`, `storageKey`, `imageSrc` o `profilePhotoUrl`.
- Cualquier nuevo canal de salida que no utilice `res.json`, como SSE o streaming de metadatos, debe aplicar `sanitizePublicPayload` antes de serializar. El streaming binario autenticado es la única excepción.
- Validar `body`, `params`, `query` y encabezados relevantes antes del controlador.
- Mantener respuestas de error con `code` y `message`; usar `fields` solo para validación.
- No devolver mensajes internos de PostgreSQL, almacenamiento ni stack traces.
- Usar consultas SQL parametrizadas; queda prohibido concatenar entradas del usuario.
- Usar paginación por cursor con límite máximo; no introducir `OFFSET` en colecciones crecientes.
- Aplicar autenticación, permisos y rate limiting según el riesgo del endpoint.
- Mantener streaming para archivos; no volver a cargar archivos completos en memoria.
- Toda migración debe revisarse manualmente, especialmente RLS, `CHECK`, claves diferibles e índices por expresiones.
- No usar `prisma db push` ni `prisma migrate reset` sobre bases con datos.

## Pruebas y aceptación

Cada funcionalidad debe cubrir, cuando corresponda:

- operación exitosa;
- datos inválidos;
- usuario sin autenticación o permiso;
- recurso inexistente;
- conflicto o duplicado;
- fallo de PostgreSQL o almacenamiento;
- paginación, deduplicación y fin de páginas;
- concurrencia para operaciones sensibles.

Antes de entregar cambios ejecutar desde `Backend`:

```powershell
pnpm verify
```

Si no hay acceso a la base de pruebas, ejecutar como mínimo:

```powershell
pnpm test
pnpm --dir ../Frontend build
```

Documentar cualquier comprobación no ejecutada y su motivo.

## Checklist de una funcionalidad nueva

- [ ] Reutiliza los módulos compartidos existentes.
- [ ] Incluye esquema Zod para entradas externas.
- [ ] Usa errores centralizados.
- [ ] Mantiene el controlador pequeño y sin SQL.
- [ ] Coloca reglas de negocio y coordinación en un servicio.
- [ ] Limita el repositorio a PostgreSQL.
- [ ] Incluye autenticación, permisos y rate limit necesarios.
- [ ] Pagina colecciones mediante cursor.
- [ ] Incluye pruebas relevantes.
- [ ] Revisa la migración Prisma si cambia la base.
- [ ] Actualiza documentación cuando cambia un contrato.
- [ ] `pnpm verify` finaliza correctamente.
