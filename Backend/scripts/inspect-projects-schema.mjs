import "dotenv/config";

import { pool, query } from "../src/config/db.js";

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
  const tables = await query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and (
        table_name ilike '%project%'
        or table_name ilike '%architect%'
        or table_name ilike '%client%'
      )
    order by table_name
  `);

  const schema = {};

  for (const row of tables.rows) {
    schema[row.table_name] = await getColumns(row.table_name);
  }

  const payload = {
    tables: tables.rows,
    schema,
  };

  if (schema.projects) {
    const projects = await query(`
      select *
      from public.projects
      order by id
      limit 5
    `);

    payload.projects = projects.rows;
  }

  console.log(JSON.stringify(payload, null, 2));
}

try {
  await main();
} finally {
  await pool.end();
}
