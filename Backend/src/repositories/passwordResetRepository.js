import { query } from "../config/db.js";

const PURPOSE = "password_reset";

export async function createPasswordResetToken(userId, tokenHash, expiresAt) {
  await query(
    `
      update public.password_reset_tokens
      set used = true
      where user_id = $1
        and purpose = $2
        and used = false
    `,
    [userId, PURPOSE],
  );

  await query(
    `
      insert into public.password_reset_tokens (
        user_id,
        token,
        code_hash,
        purpose,
        expires_at,
        created_at,
        used
      ) values ($1, $2, $2, $3, $4, now(), false)
    `,
    [userId, tokenHash, PURPOSE, expiresAt],
  );
}

export async function findValidPasswordResetToken(userId, tokenHash) {
  const result = await query(
    `
      select id, expires_at
      from public.password_reset_tokens
      where user_id = $1
        and token = $2
        and purpose = $3
        and used = false
        and expires_at > now()
      limit 1
    `,
    [userId, tokenHash, PURPOSE],
  );

  return result.rows[0] || null;
}

export async function consumePasswordResetToken(userId, tokenHash) {
  const result = await query(
    `
      update public.password_reset_tokens
      set used = true
      where id = (
        select id
        from public.password_reset_tokens
        where user_id = $1
          and token = $2
          and purpose = $3
          and used = false
          and expires_at > now()
        limit 1
      )
      returning id
    `,
    [userId, tokenHash, PURPOSE],
  );

  return result.rowCount > 0;
}
