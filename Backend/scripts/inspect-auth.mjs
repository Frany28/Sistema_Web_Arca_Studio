import "dotenv/config";

import { pool, query } from "../src/config/db.js";

const roles = await query(`
  select id, code, name, is_active
  from public.roles
  order by id
`);

const users = await query(`
  select
    count(*)::int as total,
    count(*) filter (where status = 'active')::int as active,
    min(length(password_hash)) as min_hash_length,
    max(length(password_hash)) as max_hash_length
  from public.users
`);

const hashPrefixes = await query(`
  select left(password_hash, 4) as prefix, count(*)::int as total
  from public.users
  group by 1
  order by 2 desc
`);

console.log(
  JSON.stringify(
    {
      password_hash_prefixes: hashPrefixes.rows,
      roles: roles.rows,
      users: users.rows[0],
    },
    null,
    2,
  ),
);

await pool.end();
