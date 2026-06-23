import "dotenv/config";

import { pool, query } from "../src/config/db.js";

async function renameColumn(tableName) {
  const columns = await query(
    `
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = $1
        and column_name in ('google_place_id', 'provider_place_id')
    `,
    [tableName],
  );
  const columnNames = new Set(columns.rows.map((row) => row.column_name));

  if (
    columnNames.has("google_place_id") &&
    !columnNames.has("provider_place_id")
  ) {
    await query(
      `alter table public.${tableName} rename column google_place_id to provider_place_id`,
    );
    return;
  }

  if (!columnNames.has("provider_place_id")) {
    await query(
      `alter table public.${tableName} add column provider_place_id varchar`,
    );
  }
}

try {
  await renameColumn("projects");
  await renameColumn("project_requests");

  const verification = await query(`
    select table_name, column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('projects', 'project_requests')
      and column_name in ('google_place_id', 'provider_place_id')
    order by table_name, column_name
  `);

  console.log(JSON.stringify(verification.rows, null, 2));
} finally {
  await pool.end();
}
