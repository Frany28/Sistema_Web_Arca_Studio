import "dotenv/config";

import { pool, query } from "../src/config/db.js";

const schemas = process.argv.slice(2);
const selectedSchemas = schemas.length ? schemas : ["public"];

const tablesResult = await query(`
  select table_schema, table_name, table_type
  from information_schema.tables
  where table_schema = any($1)
  order by table_schema, table_name
`, [selectedSchemas]);

const columnsResult = await query(`
  select
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
  from information_schema.columns
  where table_schema = any($1)
  order by table_schema, table_name, ordinal_position
`, [selectedSchemas]);

const schema = tablesResult.rows.map((table) => ({
  ...table,
  columns: columnsResult.rows.filter(
    (column) =>
      column.table_schema === table.table_schema &&
      column.table_name === table.table_name,
  ),
}));

console.log(JSON.stringify(schema, null, 2));

await pool.end();
