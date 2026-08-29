import "dotenv/config";

import bcrypt from "bcrypt";

import { pool, query } from "../src/config/db.js";

const DEMO_CLIENT_EMAIL = "showcase@arcastudio.com";
const DEMO_REQUESTER_EMAIL = "solicitudes.showcase@arcastudio.com";
const DEMO_REQUESTER_PASSWORD = "SolicitudDemo2026*";
const DEMO_SUBMISSION_ID = "00000000-0000-4000-8000-000000000028";
const DEMO_REQUEST_NAME = "Café Mirador Solicitud Demo";

async function findDemoRequester() {
  const existing = await query(
    `
      select user_account.id as user_id, client.id as client_id
      from public.clients client
      inner join public.users user_account on user_account.client_id = client.id
      inner join public.roles role on role.id = user_account.role_id
      where lower(user_account.email) = lower($1)
        and client.status = 'active'
        and client.deleted_at is null
        and user_account.status = 'active'
        and user_account.deleted_at is null
        and role.code = 'client'
      limit 1
    `,
    [DEMO_REQUESTER_EMAIL],
  );

  if (existing.rows[0]) return existing.rows[0];

  const clientResult = await query(
    `
      select id
      from public.clients
      where lower(email) = lower($1)
        and status = 'active'
        and deleted_at is null
      limit 1
    `,
    [DEMO_CLIENT_EMAIL],
  );
  if (!clientResult.rows[0]) {
    throw new Error("No se encontró el cliente demo Showcase.");
  }

  const roleResult = await query(
    `select id from public.roles where code = 'client' and is_active = true limit 1`,
  );
  if (!roleResult.rows[0]) throw new Error("No se encontró el rol client activo.");

  const passwordHash = await bcrypt.hash(DEMO_REQUESTER_PASSWORD, 10);
  const inserted = await query(
    `
      insert into public.users (
        client_id, role_id, email, first_name, last_name, password_hash,
        company_name, status
      ) values ($1, $2, $3, 'Cliente', 'Showcase', $4, 'ARCA Showcase', 'active')
      returning id as user_id, client_id
    `,
    [
      clientResult.rows[0].id,
      roleResult.rows[0].id,
      DEMO_REQUESTER_EMAIL,
      passwordHash,
    ],
  );

  return inserted.rows[0];
}

async function ensureDemoRequest({ client_id: clientId, user_id: userId }) {
  const existing = await query(
    `
      select id, project_name, status, requested_by, client_id
      from public.project_requests
      where submission_id = $1::uuid
        and deleted_at is null
      limit 1
    `,
    [DEMO_SUBMISSION_ID],
  );

  if (existing.rows[0]) {
    return { action: "existing", projectRequest: existing.rows[0] };
  }

  const inserted = await query(
    `
      insert into public.project_requests (
        client_id,
        requested_by,
        project_name,
        project_type,
        location,
        description,
        has_plans,
        legal_documentation_status,
        legal_document_types,
        has_multiple_owners,
        project_size,
        development_mode,
        land_status,
        investment_range,
        capital_availability,
        expected_start_time,
        decision_maker,
        quality_expectation,
        prior_design_experience,
        status,
        formatted_address,
        submission_id,
        compatibility_score,
        compatibility_level,
        compatibility_reason_codes,
        compatibility_scoring_version
      ) values (
        $1, $2, $3, 'commercial', 'El Hatillo, Caracas',
        'Diseño de una cafetería con terraza, vista panorámica y espacios flexibles.',
        false, 'in_process', ARRAY[]::text[], false,
        'medium_80_200', 'full', 'available', '50k_150k',
        'within_3_months', '3_6_months', 'self', 'premium', 'positive',
        'pending_verification', 'El Hatillo, Caracas, Venezuela', $4::uuid,
        78, 'high', '[]'::jsonb, '2.2'
      )
      returning id, project_name, status, requested_by, client_id
    `,
    [clientId, userId, DEMO_REQUEST_NAME, DEMO_SUBMISSION_ID],
  );

  return { action: "inserted", projectRequest: inserted.rows[0] };
}

try {
  const requester = await findDemoRequester();
  const result = await ensureDemoRequest(requester);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await pool.end();
}
