import "dotenv/config";

import bcrypt from "bcrypt";

import { pool, query } from "../src/config/db.js";

const email = String(process.env.TEST_USER_EMAIL || "").trim().toLowerCase();
const password = String(process.env.TEST_USER_PASSWORD || "");
const firstName = String(process.env.TEST_USER_FIRST_NAME || "Developer").trim();
const lastName = String(process.env.TEST_USER_LAST_NAME || "Test").trim();
const phone = String(process.env.TEST_USER_PHONE || "+584120000000").trim();
const roleCode = String(process.env.TEST_USER_ROLE || "admin").trim();

if (!email || !password) {
  throw new Error("TEST_USER_EMAIL and TEST_USER_PASSWORD are required");
}

if (password.length < 8) {
  throw new Error("TEST_USER_PASSWORD must contain at least 8 characters");
}

const roleResult = await query(
  `
    select id
    from public.roles
    where code = $1
      and is_active = true
    limit 1
  `,
  [roleCode],
);

const role = roleResult.rows[0];

if (!role) {
  throw new Error(`Active role not found: ${roleCode}`);
}

const passwordHash = await bcrypt.hash(password, 10);
const existingResult = await query(
  `
    select id
    from public.users
    where lower(email) = lower($1)
    limit 1
  `,
  [email],
);

const commonParams = [
  role.id,
  email,
  firstName,
  lastName,
  passwordHash,
  phone,
  "active",
];

const result = existingResult.rows[0]
  ? await query(
      `
        update public.users
        set
          role_id = $1,
          first_name = $3,
          last_name = $4,
          password_hash = $5,
          phone = $6,
          status = $7,
          deleted_at = null,
          updated_at = now()
        where lower(email) = lower($2)
        returning id, email, status
      `,
      commonParams,
    )
  : await query(
      `
        insert into public.users (
          role_id,
          email,
          first_name,
          last_name,
          password_hash,
          phone,
          status
        )
        values ($1, $2, $3, $4, $5, $6, $7)
        returning id, email, status
      `,
      commonParams,
    );

console.log(
  JSON.stringify(
    {
      action: existingResult.rows[0] ? "updated" : "inserted",
      user: result.rows[0],
    },
    null,
    2,
  ),
);

await pool.end();
