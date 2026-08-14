import "dotenv/config";

import bcrypt from "bcrypt";
import { pool, query } from "../src/config/db.js";

const [emailArgument, passwordArgument] = process.argv.slice(2);
const email = emailArgument || process.env.TEST_USER_EMAIL;
const password = passwordArgument || process.env.TEST_USER_PASSWORD;

if (!email || !password) {
  console.error(
    "Provide login values as arguments or TEST_USER_EMAIL and TEST_USER_PASSWORD.",
  );
  process.exitCode = 1;
} else {
  try {
    const result = await query(
      `
        select
          u.email,
          u.status,
          u.deleted_at is null as not_deleted,
          u.password_hash,
          r.code as role_code,
          r.is_active as role_is_active
        from public.users u
        left join public.roles r on r.id = u.role_id
        where lower(u.email) = lower($1)
        limit 1
      `,
      [email],
    );

    const row = result.rows[0];

    if (!row) {
      console.log(JSON.stringify({ found: false }, null, 2));
    } else {
      const passwordMatches = await bcrypt.compare(password, row.password_hash);

      console.log(
        JSON.stringify(
          {
            found: true,
            email: row.email,
            status: row.status,
            notDeleted: row.not_deleted,
            roleCode: row.role_code,
            roleIsActive: row.role_is_active,
            passwordHashType: /^\$2[aby]\$/.test(row.password_hash)
              ? "bcrypt"
              : "unknown",
            passwordMatches,
          },
          null,
          2,
        ),
      );
    }
  } finally {
    await pool.end();
  }
}
