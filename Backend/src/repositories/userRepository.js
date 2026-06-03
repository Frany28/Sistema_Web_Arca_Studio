import { query } from "../config/db.js";

const USER_SELECT = `
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
    r.code as role_code,
    r.name as role_name
  from public.users u
  inner join public.roles r on r.id = u.role_id
  where u.deleted_at is null
    and r.is_active = true
`;

function toSafeUser(row) {
  if (!row) {
    return null;
  }

  return {
    clientId: row.client_id ? Number(row.client_id) : null,
    email: row.email,
    firstName: row.first_name,
    id: Number(row.id),
    lastLoginAt: row.last_login_at,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`.trim(),
    phone: row.phone,
    profilePhotoUrl: row.profile_photo_url,
    role: {
      code: row.role_code,
      id: Number(row.role_id),
      name: row.role_name,
    },
    status: row.status,
  };
}

export async function findUserByEmail(email) {
  const result = await query(
    `
      ${USER_SELECT}
        and lower(u.email) = lower($1)
      limit 1
    `,
    [email],
  );

  return result.rows[0] || null;
}

export async function findActiveUserById(id) {
  const result = await query(
    `
      ${USER_SELECT}
        and u.id = $1
        and u.status = 'active'
      limit 1
    `,
    [id],
  );

  return toSafeUser(result.rows[0]);
}

export async function updateLastLoginAt(id) {
  await query(
    `
      update public.users
      set last_login_at = now(), updated_at = now()
      where id = $1
    `,
    [id],
  );
}

export async function updateUserPassword(id, passwordHash) {
  await query(
    `
      update public.users
      set password_hash = $2, updated_at = now()
      where id = $1
    `,
    [id, passwordHash],
  );
}

export function sanitizeUser(row) {
  return toSafeUser(row);
}
