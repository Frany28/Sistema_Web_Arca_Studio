import "dotenv/config";

import { pool, query } from "../src/config/db.js";

async function tableExists(tableName) {
  const result = await query(
    `
      select exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = $1
      ) as exists
    `,
    [tableName],
  );

  return Boolean(result.rows[0]?.exists);
}

async function getColumns(tableName) {
  const result = await query(
    `
      select column_name, data_type, is_nullable
      from information_schema.columns
      where table_schema = 'public'
        and table_name = $1
      order by ordinal_position
    `,
    [tableName],
  );

  return result.rows;
}

async function main() {
  const matchingTables = await query(`
    select table_schema, table_name
    from information_schema.tables
    where table_schema = 'public'
      and (
        table_name ilike '%role%'
        or table_name ilike '%permission%'
        or table_name ilike '%permiso%'
        or table_name ilike '%user%'
      )
    order by table_schema, table_name
  `);

  const knownTables = [
    "roles",
    "permissions",
    "role_permissions",
    "users",
  ];
  const schema = {};

  for (const tableName of knownTables) {
    if (await tableExists(tableName)) {
      schema[tableName] = await getColumns(tableName);
    }
  }

  const roles = await query(`
    select *
    from public.roles
    order by id
  `);

  const payload = {
    tables: matchingTables.rows,
    schema,
    roles: roles.rows,
  };

  if (await tableExists("permissions")) {
    const permissions = await query(`
      select *
      from public.permissions
      order by id
    `);
    payload.permissions = permissions.rows;
  }

  if (await tableExists("role_permissions")) {
    const rolePermissions = await query(`
      select *
      from public.role_permissions
      order by role_id, permission_id
    `);
    payload.role_permissions = rolePermissions.rows;
  }

  console.log(JSON.stringify(payload, null, 2));
}

try {
  await main();
} finally {
  await pool.end();
}
