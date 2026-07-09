import "dotenv/config";

import { pool, query } from "../src/config/db.js";

const PERMISSIONS = [
  {
    code: "projects.files.upload",
    description: "Permite subir archivos a proyectos accesibles",
    module: "projects",
    name: "Subir archivos de proyecto",
  },
  {
    code: "projects.files.delete",
    description: "Permite eliminar archivos propios en proyectos accesibles",
    module: "projects",
    name: "Eliminar archivos de proyecto",
  },
  {
    code: "support.requests.create",
    description: "Permite crear solicitudes de soporte",
    module: "support",
    name: "Crear solicitudes de soporte",
  },
  {
    code: "support.files.upload",
    description: "Permite adjuntar archivos a solicitudes de soporte",
    module: "support",
    name: "Subir archivos de soporte",
  },
];

const ROLE_CODES = ["admin", "architect", "client"];

async function upsertPermission(permission) {
  const result = await query(
    `
      insert into public.permissions (
        code,
        name,
        description,
        module,
        is_active
      )
      values ($1, $2, $3, $4, true)
      on conflict (code) do update
      set
        name = excluded.name,
        description = excluded.description,
        module = excluded.module,
        is_active = true,
        updated_at = now()
      returning id, code
    `,
    [
      permission.code,
      permission.name,
      permission.description,
      permission.module,
    ],
  );

  return result.rows[0];
}

async function assignPermissionToRoles(permissionId) {
  await query(
    `
      insert into public.role_permissions (role_id, permission_id, is_active)
      select r.id, $1, true
      from public.roles r
      where r.code = any($2::text[])
        and r.is_active = true
        and not exists (
          select 1
          from public.role_permissions rp
          where rp.role_id = r.id
            and rp.permission_id = $1
        )
    `,
    [permissionId, ROLE_CODES],
  );

  await query(
    `
      update public.role_permissions rp
      set is_active = true
      from public.roles r
      where r.id = rp.role_id
        and r.code = any($2::text[])
        and rp.permission_id = $1
    `,
    [permissionId, ROLE_CODES],
  );
}

async function main() {
  const permissions = [];

  for (const permissionDefinition of PERMISSIONS) {
    const permission = await upsertPermission(permissionDefinition);
    await assignPermissionToRoles(permission.id);
    permissions.push(permission);
  }

  console.log(
    JSON.stringify(
      {
        permissions,
        roles: ROLE_CODES,
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} finally {
  await pool.end();
}
