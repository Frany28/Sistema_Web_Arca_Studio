import "dotenv/config";

import { pool, query } from "../src/config/db.js";

try {
  const result = await query(`
    select
      u.id,
      u.email,
      u.status,
      r.code as role_code
    from public.users u
    inner join public.roles r on r.id = u.role_id
    where u.deleted_at is null
      and r.code = 'client'
    order by u.id
    limit 50
  `);

  console.log(JSON.stringify(result.rows, null, 2));
} finally {
  await pool.end();
}
