import { pool } from "../src/config/db.js";

try {
  const result = await pool.query(
    `select
       to_regclass('public.environment_comments') is not null as table_exists,
       has_table_privilege(
         current_user,
         'public.environment_comments',
         'SELECT'
       ) as can_read,
       has_table_privilege(
         current_user,
         'public.environment_comments',
         'INSERT'
       ) as can_create,
       exists (
         select 1
         from public._prisma_migrations
         where migration_name = $1
           and finished_at is not null
           and rolled_back_at is null
       ) as migration_applied`,
    ["20260806000000_environment_comments"],
  );
  const row = result.rows[0];
  process.stdout.write(
    JSON.stringify({
      canCreate: row.can_create,
      canRead: row.can_read,
      migrationApplied: row.migration_applied,
      tableExists: row.table_exists,
    }),
  );
} finally {
  await pool.end();
}
