import "dotenv/config";

import { pool, query } from "../src/config/db.js";

async function addLocationColumns(tableName) {
  await query(`
    alter table public.${tableName}
    add column if not exists location_latitude numeric(10,7),
    add column if not exists location_longitude numeric(10,7),
    add column if not exists provider_place_id varchar,
    add column if not exists formatted_address varchar
  `);
}

try {
  await addLocationColumns("projects");
  await addLocationColumns("project_requests");

  const verification = await query(`
    select table_name, column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('projects', 'project_requests')
      and column_name in (
        'location_latitude',
        'location_longitude',
        'provider_place_id',
        'formatted_address'
      )
    order by table_name, column_name
  `);

  console.log(JSON.stringify(verification.rows, null, 2));
} finally {
  await pool.end();
}
