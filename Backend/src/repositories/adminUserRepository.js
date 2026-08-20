import { query } from "../config/db.js";
import { mapAdminUserMetrics } from "../utils/adminUsers.js";

export async function getAdminUserMetrics() {
  const result = await query(`
    select
      count(*)::int as total,
      count(*) filter (where status = 'active')::int as active,
      count(*) filter (where status = 'blocked')::int as suspended,
      count(*) filter (where status = 'inactive')::int as disabled
    from public.users
    where deleted_at is null
  `);
  return mapAdminUserMetrics(result.rows[0]);
}

export async function listAdminUsers({ cursor, limit, role, search, status }) {
  const result = await query(
    `
      select
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.status,
        u.last_login_at,
        u.created_at,
        r.code as role_code,
        r.name as role_name
      from public.users u
      inner join public.roles r on r.id = u.role_id
      where u.deleted_at is null
        and ($1::text is null or (
          u.email ilike '%' || $1 || '%'
          or concat_ws(' ', u.first_name, u.last_name) ilike '%' || $1 || '%'
        ))
        and ($2::text is null or r.code = $2)
        and ($3::public.user_status is null or u.status = $3)
        and ($4::timestamptz is null or (u.created_at, u.id) < ($4, $5::bigint))
      order by u.created_at desc, u.id desc
      limit $6
    `,
    [
      search || null,
      role || null,
      status || null,
      cursor?.[0] || null,
      cursor?.[1] || null,
      limit + 1,
    ],
  );

  return result.rows;
}
