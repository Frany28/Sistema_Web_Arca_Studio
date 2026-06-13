import "dotenv/config";

import { pool, query } from "../src/config/db.js";
import { listProjectsForUser } from "../src/repositories/projectRepository.js";
import { sanitizeUser } from "../src/repositories/userRepository.js";

async function getUserByRole(roleCode) {
  const result = await query(
    `
      select
        u.id,
        u.client_id,
        u.role_id,
        u.email,
        u.first_name,
        u.last_name,
        u.password_hash,
        u.profile_photo_url,
        u.phone,
        u.status,
        u.last_login_at,
        u.updated_at,
        r.code as role_code,
        r.name as role_name,
        '[]'::json as permissions
      from public.users u
      inner join public.roles r on r.id = u.role_id
      where u.deleted_at is null
        and u.status = 'active'
        and r.code = $1
      order by u.id
      limit 1
    `,
    [roleCode],
  );

  return sanitizeUser(result.rows[0]);
}

try {
  const roles = ["admin", "architect", "client"];
  const payload = [];

  for (const roleCode of roles) {
    const user = await getUserByRole(roleCode);
    const projects = user ? await listProjectsForUser(user) : [];

    payload.push({
      role: roleCode,
      userId: user?.id || null,
      projectIds: projects.map((project) => project.id),
      total: projects.length,
    });
  }

  console.log(JSON.stringify(payload, null, 2));
} finally {
  await pool.end();
}
