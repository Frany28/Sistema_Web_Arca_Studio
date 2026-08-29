import { pool, query } from "../config/db.js";
import { mapAdminUserMetrics } from "../utils/adminUsers.js";

export async function findAdminUserConflict({ email, phone, secondaryPhone }) {
  const phones = [phone, secondaryPhone].filter(Boolean);
  const result = await query(
    `
      select
        exists(
          select 1 from public.users
          where deleted_at is null and lower(email) = lower($1)
        ) as email_exists,
        exists(
          select 1 from public.users
          where deleted_at is null
            and $2::text[] <> '{}'::text[]
            and (phone = any($2::text[]) or secondary_phone = any($2::text[]))
        ) as phone_exists
    `,
    [email, phones],
  );
  return result.rows[0] || { email_exists: false, phone_exists: false };
}

export async function createAdminUserRecord({
  companyName,
  email,
  firstName,
  lastName,
  passwordHash,
  phone,
  roleCode,
  secondaryPhone,
  status,
}) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const roleResult = await client.query(
      `select id, code, name from public.roles where code = $1 and is_active = true limit 1`,
      [roleCode],
    );
    const role = roleResult.rows[0];
    if (!role) {
      await client.query("rollback");
      return null;
    }

    let clientId = null;
    if (role.code === "client") {
      const clientResult = await client.query(
        `
          insert into public.clients (name, company_name, email, phone, status)
          values ($1, $2, $3, $4, $5::public.client_status)
          returning id
        `,
        [
          `${firstName} ${lastName}`,
          companyName,
          email,
          phone,
          status === "active" ? "active" : "inactive",
        ],
      );
      clientId = clientResult.rows[0].id;
    }

    const userResult = await client.query(
      `
        insert into public.users (
          client_id, role_id, email, first_name, last_name, password_hash,
          phone, secondary_phone, company_name, status
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning id, email, first_name, last_name, phone, secondary_phone,
          company_name, status, created_at
      `,
      [clientId, role.id, email, firstName, lastName, passwordHash, phone, secondaryPhone, companyName, status],
    );
    await client.query("commit");
    return { ...userResult.rows[0], client_id: clientId, role_code: role.code, role_name: role.name };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteCreatedAdminUser({ userId, clientId }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(`delete from public.users where id = $1`, [userId]);
    if (clientId) await client.query(`delete from public.clients where id = $1`, [clientId]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

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

export async function updateAdminUserStatusRecord({ status, userId }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await client.query(
      `
        update public.users u
        set status = $2::public.user_status, updated_at = now()
        from public.roles r
        where u.id = $1
          and u.deleted_at is null
          and r.id = u.role_id
        returning u.id, u.client_id, u.email, u.first_name, u.last_name,
          u.status, u.last_login_at, u.created_at,
          r.code as role_code, r.name as role_name
      `,
      [userId, status],
    );
    const updatedUser = result.rows[0] || null;

    if (updatedUser?.client_id) {
      await client.query(
        `
          update public.clients
          set status = $2::public.client_status, updated_at = now()
          where id = $1 and deleted_at is null
        `,
        [updatedUser.client_id, status === "active" ? "active" : "inactive"],
      );
    }

    await client.query("commit");
    return updatedUser;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
