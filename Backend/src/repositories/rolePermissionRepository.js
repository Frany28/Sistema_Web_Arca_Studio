import { pool, query } from "../config/db.js";

function toRole(row) {
  return {
    code: row.code,
    description: row.description || null,
    id: Number(row.id),
    isActive: Boolean(row.is_active),
    name: row.name,
  };
}

function toPermission(row) {
  return {
    code: row.code,
    description: row.description || null,
    id: Number(row.id),
    isActive: Boolean(row.is_active),
    module: row.module,
    name: row.name,
  };
}

function groupPermissionsByModule(permissions) {
  return permissions.reduce((groups, permission) => {
    if (!groups[permission.module]) {
      groups[permission.module] = [];
    }

    groups[permission.module].push(permission);
    return groups;
  }, {});
}

function buildRolePermissionBoundary(rows) {
  const rolesById = new Map();

  for (const row of rows) {
    const roleId = Number(row.role_id);

    if (!rolesById.has(roleId)) {
      rolesById.set(roleId, {
        role: {
          code: row.role_code,
          description: row.role_description || null,
          id: roleId,
          isActive: Boolean(row.role_is_active),
          name: row.role_name,
        },
        permissions: [],
        permissionCodes: [],
        permissionsByModule: {},
      });
    }

    if (row.permission_id) {
      const permission = {
        code: row.permission_code,
        description: row.permission_description || null,
        id: Number(row.permission_id),
        isActive: Boolean(row.permission_is_active),
        module: row.permission_module,
        name: row.permission_name,
      };
      const boundary = rolesById.get(roleId);

      boundary.permissions.push(permission);
      boundary.permissionCodes.push(permission.code);
    }
  }

  return Array.from(rolesById.values()).map((boundary) => ({
    ...boundary,
    permissionsByModule: groupPermissionsByModule(boundary.permissions),
  }));
}

export async function listRoles({ includeInactive = false } = {}) {
  const result = await query(
    `
      select id, code, name, description, is_active
      from public.roles
      where ($1::boolean = true or is_active = true)
      order by id
    `,
    [includeInactive],
  );

  return result.rows.map(toRole);
}

export async function listPermissions({ includeInactive = false } = {}) {
  const result = await query(
    `
      select id, code, name, description, module, is_active
      from public.permissions
      where ($1::boolean = true or is_active = true)
      order by module, code
    `,
    [includeInactive],
  );

  return result.rows.map(toPermission);
}

export async function getRolePermissionBoundaries({
  includeInactive = false,
} = {}) {
  const result = await query(
    `
      select
        r.id as role_id,
        r.code as role_code,
        r.name as role_name,
        r.description as role_description,
        r.is_active as role_is_active,
        p.id as permission_id,
        p.code as permission_code,
        p.name as permission_name,
        p.description as permission_description,
        p.module as permission_module,
        p.is_active as permission_is_active
      from public.roles r
      left join public.role_permissions rp
        on rp.role_id = r.id
        and rp.is_active = true
      left join public.permissions p
        on p.id = rp.permission_id
        and ($1::boolean = true or p.is_active = true)
      where ($1::boolean = true or r.is_active = true)
      order by r.id, p.module, p.code
    `,
    [includeInactive],
  );

  return buildRolePermissionBoundary(result.rows);
}

export async function getRolePermissionBoundary(roleCode) {
  const boundaries = await getRolePermissionBoundaries();
  return boundaries.find((boundary) => boundary.role.code === roleCode) || null;
}

export async function replaceRolePermissions(roleCode, permissionCodes) {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const roleResult = await client.query(
      `
        select id, code, name, description, is_active
        from public.roles
        where code = $1
          and is_active = true
        limit 1
      `,
      [roleCode],
    );
    const role = roleResult.rows[0];

    if (!role) {
      await client.query("rollback");
      return {
        error: "ROLE_NOT_FOUND",
        role: null,
      };
    }

    const normalizedCodes = Array.from(
      new Set(
        permissionCodes
          .map((code) => String(code || "").trim())
          .filter(Boolean),
      ),
    );

    const permissionsResult = await client.query(
      `
        select id, code, name, description, module, is_active
        from public.permissions
        where code = any($1::text[])
          and is_active = true
        order by module, code
      `,
      [normalizedCodes],
    );
    const permissions = permissionsResult.rows;
    const foundCodes = new Set(permissions.map((permission) => permission.code));
    const missingPermissionCodes = normalizedCodes.filter(
      (code) => !foundCodes.has(code),
    );

    if (missingPermissionCodes.length) {
      await client.query("rollback");
      return {
        error: "PERMISSIONS_NOT_FOUND",
        missingPermissionCodes,
        role: toRole(role),
      };
    }

    await client.query(
      `
        update public.role_permissions
        set is_active = false
        where role_id = $1
      `,
      [role.id],
    );

    if (permissions.length) {
      await client.query(
        `
          update public.role_permissions
          set is_active = true
          where role_id = $1
            and permission_id = any($2::bigint[])
        `,
        [role.id, permissions.map((permission) => permission.id)],
      );

      await client.query(
        `
          insert into public.role_permissions (role_id, permission_id, is_active)
          select $1, requested.permission_id, true
          from unnest($2::bigint[]) as requested(permission_id)
          where not exists (
            select 1
            from public.role_permissions rp
            where rp.role_id = $1
              and rp.permission_id = requested.permission_id
          )
        `,
        [role.id, permissions.map((permission) => permission.id)],
      );
    }

    await client.query(
      `
        update public.roles
        set updated_at = now()
        where id = $1
      `,
      [role.id],
    );
    await client.query("commit");

    return {
      error: null,
      boundary: await getRolePermissionBoundary(roleCode),
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
