import "dotenv/config";

import { pool, query } from "../src/config/db.js";

async function main() {
  await query(`
    alter table public.projects
    add column if not exists is_public boolean not null default false
  `);

  const permissionResult = await query(`
    insert into public.permissions (
      code,
      name,
      description,
      module,
      is_active
    )
    values (
      'projects.publish',
      'Publicar proyectos',
      'Permite activar o desactivar la visibilidad publica de proyectos',
      'projects',
      true
    )
    on conflict (code) do update
    set
      name = excluded.name,
      description = excluded.description,
      module = excluded.module,
      is_active = true,
      updated_at = now()
    returning id, code
  `);

  const permission = permissionResult.rows[0];

  await query(
    `
      insert into public.role_permissions (role_id, permission_id, is_active)
      select r.id, $1, true
      from public.roles r
      where r.code = 'admin'
        and r.is_active = true
        and not exists (
          select 1
          from public.role_permissions rp
          where rp.role_id = r.id
            and rp.permission_id = $1
        )
    `,
    [permission.id],
  );

  await query(
    `
      update public.role_permissions rp
      set is_active = true
      from public.roles r
      where r.id = rp.role_id
        and r.code = 'admin'
        and rp.permission_id = $1
    `,
    [permission.id],
  );

  const verification = await query(`
    select
      p.id,
      p.name,
      p.is_public
    from public.projects p
    where p.deleted_at is null
    order by p.id
  `);

  console.log(
    JSON.stringify(
      {
        permission,
        projects: verification.rows,
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
