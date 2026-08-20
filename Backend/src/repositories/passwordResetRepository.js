import { query } from "../config/db.js";

export async function createPasswordResetToken(userId, tokenHash, expiresAt) {
  await query(
    `
      update public.password_recovery_tokens
      set used_at = now()
      where user_id = $1
        and used_at is null
    `,
    [userId],
  );

  await query(
    `
      insert into public.password_recovery_tokens (
        user_id,
        token_hash,
        expires_at,
        created_at
      ) values ($1, $2, $3, now())
    `,
    [userId, tokenHash, expiresAt],
  );
}

export async function deletePasswordResetTokensForUser(userId) {
  await query(`delete from public.password_recovery_tokens where user_id = $1`, [userId]);
}

export async function findValidPasswordResetToken(userId, tokenHash) {
  const result = await query(
    `
      select id, expires_at
      from public.password_recovery_tokens
      where user_id = $1
        and token_hash = $2
        and used_at is null
        and expires_at > now()
      limit 1
    `,
    [userId, tokenHash],
  );

  return result.rows[0] || null;
}

export async function consumePasswordResetToken(userId, tokenHash) {
  const result = await query(
    `
      update public.password_recovery_tokens
      set used_at = now()
      where id = (
        select id
        from public.password_recovery_tokens
        where user_id = $1
          and token_hash = $2
          and used_at is null
          and expires_at > now()
        limit 1
      )
      returning id
    `,
    [userId, tokenHash],
  );

  return result.rowCount > 0;
}
