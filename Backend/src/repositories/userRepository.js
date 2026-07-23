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
    u.updated_at,
    r.code as role_code,
    r.name as role_name,
    coalesce(role_permissions.permissions, '[]'::json) as permissions
  from public.users u
  inner join public.roles r on r.id = u.role_id
  left join lateral (
    select json_agg(
      json_build_object(
        'id', p.id,
        'code', p.code,
        'name', p.name,
        'description', p.description,
        'module', p.module
      )
      order by p.module, p.code
    ) as permissions
    from public.role_permissions rp
    inner join public.permissions p on p.id = rp.permission_id
    where rp.role_id = u.role_id
      and rp.is_active = true
      and p.is_active = true
  ) role_permissions on true
  where u.deleted_at is null
    and r.is_active = true
`;

function normalizePermissions(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toSafeUser(row) {
  if (!row) {
    return null;
  }

  const permissions = normalizePermissions(row.permissions).map((permission) => ({
    code: permission.code,
    description: permission.description || null,
    id: Number(permission.id),
    module: permission.module,
    name: permission.name,
  }));

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
    permissions,
    permissionCodes: permissions.map((permission) => permission.code),
    status: row.status,
    updatedAt: row.updated_at || null,
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

export async function findActiveUserCredentialsById(id) {
  const result = await query(
    `
      select id, password_hash
      from public.users
      where id = $1
        and status = 'active'
        and deleted_at is null
      limit 1
    `,
    [id],
  );

  return result.rows[0] || null;
}

export async function updateLastLoginAt(id) {
  await query(
    `
      update public.users
      set last_login_at = now()
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

export async function updateUserProfilePhotoUrl(id, profilePhotoUrl) {
  await query(
    `
      update public.users
      set profile_photo_url = $2, updated_at = now()
      where id = $1
        and status = 'active'
        and deleted_at is null
    `,
    [id, profilePhotoUrl],
  );

  return findActiveUserById(id);
}

export function sanitizeUser(row) {
  return toSafeUser(row);
}

export function toPublicUser(user) {
  if (!user) return null;

  const { profilePhotoUrl, ...publicUser } = user;
  return {
    ...publicUser,
    hasProfilePhoto: Boolean(profilePhotoUrl),
  };
}
