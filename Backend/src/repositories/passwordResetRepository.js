import { query } from "../config/db.js";

export async function createPasswordResetToken(
  userId,
  token,
  codeHash,
  expiresAt,
) {
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
      ) values ($1, $2, $3, $4, now(), false)
    `,
    [userId, token, codeHash, expiresAt],
  );
}
