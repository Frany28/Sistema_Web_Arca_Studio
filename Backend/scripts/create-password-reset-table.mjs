import { query } from "../src/config/db.js";

const sql = `
  create table if not exists public.password_reset_tokens (
    id serial primary key,
    user_id integer not null references public.users(id) on delete cascade,
    token text not null,
    code_hash text not null,
    purpose text not null,
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    used boolean not null default false
  );

  create index if not exists password_reset_tokens_lookup_idx
    on public.password_reset_tokens (user_id, token, purpose, used, expires_at);

  create index if not exists password_reset_tokens_cleanup_idx
    on public.password_reset_tokens (expires_at);
`;

try {
  await query(sql);
  console.log("Created password_reset_tokens table successfully.");
  process.exit(0);
} catch (error) {
  console.error("Failed to create password_reset_tokens table:", error.message);
  process.exit(1);
}
