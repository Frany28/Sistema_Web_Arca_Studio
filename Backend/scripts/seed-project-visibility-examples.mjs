import "dotenv/config";

import { pool, query } from "../src/config/db.js";

const examples = [
  {
    assignedArchitectId: null,
    budget: 22000,
    clientId: null,
    constructionArea: 95,
    description: "Proyecto publico de ejemplo para validar visibilidad general.",
    generalArea: 120,
    isPublic: true,
    location: "Caracas, Distrito Capital",
    name: "Casa Publica Arca",
  },
  {
    assignedArchitectId: 2,
    budget: 18500,
    clientId: 1,
    constructionArea: 82,
    description: "Proyecto privado de ejemplo visible solo por admin, cliente y arquitecto encargado.",
    generalArea: 110,
    isPublic: false,
    location: "San Cristobal, Tachira",
    name: "Loft Privado Arca",
  },
];

async function ensureShowcaseClient() {
  const email = "showcase@arcastudio.com";
  const existing = await query(
    `
      select id
      from public.clients
      where lower(email) = lower($1)
        and deleted_at is null
      limit 1
    `,
    [email],
  );

  if (existing.rows[0]) {
    return Number(existing.rows[0].id);
  }

  const result = await query(
    `
      insert into public.clients (
        name,
        company_name,
        document_number,
        email,
        phone,
        address,
        city,
        country,
        status,
        notes
      )
      values (
        'Cliente Showcase',
        'ARCA Showcase',
        'SHOWCASE-001',
        $1,
        '+584120000099',
        'Direccion demo',
        'Caracas',
        'Venezuela',
        'active',
        'Cliente usado para proyectos publicos de demostracion'
      )
      returning id
    `,
    [email],
  );

  return Number(result.rows[0].id);
}

async function upsertProject(example) {
  const existing = await query(
    `
      select id
      from public.projects
      where lower(name) = lower($1)
        and deleted_at is null
      limit 1
    `,
    [example.name],
  );

  const params = [
    example.clientId,
    1,
    example.assignedArchitectId,
    example.name,
    example.description,
    "in_process",
    "2026-06-13",
    "2026-09-30",
    example.budget,
    25,
    "residential",
    example.location,
    "Venezuela",
    true,
    example.generalArea,
    example.constructionArea,
    "mts",
    example.isPublic,
  ];

  if (existing.rows[0]) {
    const result = await query(
      `
        update public.projects
        set
          client_id = $1,
          created_by = $2,
          assigned_architect_id = $3,
          name = $4,
          description = $5,
          status = $6,
          start_date = $7,
          end_date = $8,
          budget = $9,
          progress = $10,
          project_type = $11,
          location = $12,
          country = $13,
          has_plans = $14,
          general_area = $15,
          construction_area = $16,
          area_unit = $17,
          is_public = $18,
          updated_at = now()
        where id = $19
        returning id, name, is_public, assigned_architect_id
      `,
      [...params, existing.rows[0].id],
    );

    return {
      action: "updated",
      project: result.rows[0],
    };
  }

  const result = await query(
    `
      insert into public.projects (
        client_id,
        created_by,
        assigned_architect_id,
        name,
        description,
        status,
        start_date,
        end_date,
        budget,
        progress,
        project_type,
        location,
        country,
        has_plans,
        general_area,
        construction_area,
        area_unit,
        is_public
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      returning id, name, is_public, assigned_architect_id
    `,
    params,
  );

  return {
    action: "inserted",
    project: result.rows[0],
  };
}

try {
  const results = [];
  const showcaseClientId = await ensureShowcaseClient();

  examples[0].clientId = showcaseClientId;

  for (const example of examples) {
    results.push(await upsertProject(example));
  }

  console.log(JSON.stringify(results, null, 2));
} finally {
  await pool.end();
}
