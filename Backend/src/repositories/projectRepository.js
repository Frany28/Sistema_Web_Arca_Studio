import { query } from "../config/db.js";

function toNumber(value) {
  return value === null || value === undefined ? null : Number(value);
}

function toProject(row) {
  return {
    areaUnit: row.area_unit,
    assignedArchitect: row.assigned_architect_id
      ? {
          email: row.architect_email,
          firstName: row.architect_first_name,
          id: Number(row.assigned_architect_id),
          lastName: row.architect_last_name,
          name: `${row.architect_first_name || ""} ${
            row.architect_last_name || ""
          }`.trim(),
        }
      : null,
    budget: toNumber(row.budget),
    city: row.city || null,
    client: {
      email: row.client_email,
      id: Number(row.client_id),
      name: row.client_name,
      phone: row.client_phone,
    },
    constructionArea: toNumber(row.construction_area),
    country: row.country || null,
    createdAt: row.created_at,
    createdBy: Number(row.created_by),
    description: row.description || null,
    endDate: row.end_date,
    generalArea: toNumber(row.general_area),
    hasPlans: Boolean(row.has_plans),
    id: Number(row.id),
    isPublic: Boolean(row.is_public),
    location: row.location,
    name: row.name,
    progress: Number(row.progress),
    projectType: row.project_type,
    startDate: row.start_date,
    state: row.state || null,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function listProjectsForUser(user) {
  const roleCode = user?.role?.code;
  const params = [];
  let accessCondition = "false";

  if (roleCode === "admin") {
    accessCondition = "true";
  } else if (roleCode === "architect") {
    params.push(user.id);
    accessCondition = `(p.assigned_architect_id = $${params.length} or p.is_public = true)`;
  } else if (roleCode === "client" && user.clientId) {
    params.push(user.clientId);
    accessCondition = `(p.client_id = $${params.length} or p.is_public = true)`;
  }

  const result = await query(
    `
      select
        p.id,
        p.client_id,
        p.created_by,
        p.assigned_architect_id,
        p.name,
        p.description,
        p.status,
        p.start_date,
        p.end_date,
        p.budget,
        p.progress,
        p.created_at,
        p.updated_at,
        p.project_type,
        p.location,
        p.city,
        p.state,
        p.country,
        p.has_plans,
        p.general_area,
        p.construction_area,
        p.area_unit,
        p.is_public,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        architect.email as architect_email,
        architect.first_name as architect_first_name,
        architect.last_name as architect_last_name
      from public.projects p
      inner join public.clients c on c.id = p.client_id
      left join public.users architect on architect.id = p.assigned_architect_id
      where p.deleted_at is null
        and c.deleted_at is null
        and (${accessCondition})
      order by p.updated_at desc, p.id desc
    `,
    params,
  );

  return result.rows.map(toProject);
}

export async function updateProjectVisibility(projectId, isPublic) {
  const result = await query(
    `
      with updated_project as (
        update public.projects
        set
          is_public = $2,
          updated_at = now()
        where id = $1
          and deleted_at is null
        returning *
      )
      select
        p.id,
        p.client_id,
        p.created_by,
        p.assigned_architect_id,
        p.name,
        p.description,
        p.status,
        p.start_date,
        p.end_date,
        p.budget,
        p.progress,
        p.created_at,
        p.updated_at,
        p.project_type,
        p.location,
        p.city,
        p.state,
        p.country,
        p.has_plans,
        p.general_area,
        p.construction_area,
        p.area_unit,
        p.is_public,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        architect.email as architect_email,
        architect.first_name as architect_first_name,
        architect.last_name as architect_last_name
      from updated_project p
      inner join public.clients c on c.id = p.client_id
      left join public.users architect on architect.id = p.assigned_architect_id
    `,
    [projectId, isPublic],
  );

  return result.rows[0] ? toProject(result.rows[0]) : null;
}
