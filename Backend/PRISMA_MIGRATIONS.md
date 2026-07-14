# Migraciones de base de datos con Prisma

El backend usa **Prisma Migrate 7.8** para registrar y desplegar cambios de PostgreSQL. Las consultas de la aplicación siguen usando `pg`; Prisma Client no reemplaza los repositorios actuales.

## Estado inicial

La base ya existía antes de incorporar Prisma. La migración `20260713000000_baseline` representa su estructura completa al 13 de julio de 2026, incluidos:

- 21 tablas y sus relaciones;
- índices de proyectos, comentarios y archivos;
- restricciones `CHECK` y claves diferibles;
- índices por expresiones, incluida la unicidad de puntos 3D;
- activación de Row Level Security.

El baseline está registrado como aplicado en la base de pruebas. No debe ejecutarse manualmente sobre esa base. En una base vacía, `prisma migrate deploy` sí lo utiliza para construir toda la estructura.

## Flujo para un cambio nuevo

1. Modificar `prisma/schema.prisma` para cambios que Prisma pueda representar.
2. Ejecutar en desarrollo:

   ```powershell
   pnpm db:migrate:dev --name nombre_del_cambio
   ```

3. Revisar siempre el `migration.sql` generado antes de conservarlo.
4. Para RLS, índices por expresiones, restricciones especiales o SQL avanzado, editar ese `migration.sql` manualmente.
5. Validar primero sobre la base de pruebas.
6. En staging o producción ejecutar únicamente:

   ```powershell
   pnpm db:migrate:deploy
   ```

7. Confirmar el estado con:

   ```powershell
   pnpm db:migrate:status
   ```

No usar `prisma db push` ni `prisma migrate reset` sobre bases con datos. No usar `migrate dev` en producción.

## Base existente y sincronización

`pnpm db:pull` vuelve a leer la estructura real y actualiza `schema.prisma`. Debe usarse con cuidado porque Prisma no representa completamente RLS, restricciones `CHECK`, claves diferibles ni índices por expresiones. Esas características deben conservarse en SQL manual dentro de las migraciones.

Prisma mantiene su historial en la tabla `_prisma_migrations`. Los antiguos archivos SQL independientes fueron retirados porque sus cambios ya forman parte del baseline; desde ahora la única fuente de migraciones es `prisma/migrations`.

El comando `pnpm verify` valida el esquema, confirma el estado de migraciones, ejecuta las pruebas del backend y construye el frontend. Requiere acceso a la base configurada para consultar el estado.

## Despliegue futuro en VPS

Durante el despliegue:

```text
backup de PostgreSQL
→ instalar dependencias
→ pnpm db:migrate:deploy
→ pnpm db:migrate:status
→ iniciar o reiniciar el backend
```

El comando de despliegue aplica solamente migraciones pendientes. Si una falla, Prisma la registra y detiene el proceso para evitar continuar con una estructura incompleta.
