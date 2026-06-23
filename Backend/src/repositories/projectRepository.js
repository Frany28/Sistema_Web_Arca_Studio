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
          profilePhotoUrl: row.architect_profile_photo_url || null,
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
    locationCoordinates:
      row.location_latitude !== null &&
      row.location_latitude !== undefined &&
      row.location_longitude !== null &&
      row.location_longitude !== undefined
        ? {
            latitude: Number(row.location_latitude),
            longitude: Number(row.location_longitude),
          }
        : null,
    locationFormattedAddress: row.formatted_address || null,
    providerPlaceId: row.provider_place_id || null,
    name: row.name,
    progress: Number(row.progress),
    projectType: row.project_type,
    startDate: row.start_date,
    state: row.state || null,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function getProjectAccess(user, projectAlias = "p") {
  const roleCode = user?.role?.code;
  const params = [];
  let condition = "false";

  if (roleCode === "admin") {
    condition = "true";
  } else if (roleCode === "architect") {
    params.push(user.id);
    condition = `(${projectAlias}.assigned_architect_id = $${params.length} or ${projectAlias}.is_public = true)`;
  } else if (roleCode === "client" && user.clientId) {
    params.push(user.clientId);
    condition = `(${projectAlias}.client_id = $${params.length} or ${projectAlias}.is_public = true)`;
  }

  return { condition, params };
}

export async function listProjectsForUser(user) {
  const { condition: accessCondition, params } = getProjectAccess(user);

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
        p.location_latitude,
        p.location_longitude,
        p.provider_place_id,
        p.formatted_address,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        architect.email as architect_email,
        architect.first_name as architect_first_name,
        architect.last_name as architect_last_name,
        architect.profile_photo_url as architect_profile_photo_url
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

export async function findProjectDetailForUser(projectId, user) {
  const { condition: accessCondition, params } = getProjectAccess(user);
  params.push(projectId);
  const projectIdParameter = `$${params.length}`;

  const projectResult = await query(
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
        p.location_latitude,
        p.location_longitude,
        p.provider_place_id,
        p.formatted_address,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        architect.email as architect_email,
        architect.first_name as architect_first_name,
        architect.last_name as architect_last_name,
        architect.profile_photo_url as architect_profile_photo_url
      from public.projects p
      inner join public.clients c on c.id = p.client_id
      left join public.users architect on architect.id = p.assigned_architect_id
      where p.id = ${projectIdParameter}
        and p.deleted_at is null
        and c.deleted_at is null
        and (${accessCondition})
      limit 1
    `,
    params,
  );

  if (!projectResult.rows[0]) {
    return null;
  }

  const [requirementsResult, specificationsResult, filesResult] =
    await Promise.all([
      query(
        `
          select id, description, sort_order
          from public.project_requirements
          where project_id = $1
            and deleted_at is null
          order by sort_order, id
        `,
        [projectId],
      ),
      query(
        `
          select
            specification.id,
            specification.title,
            specification.description,
            specification.sort_order,
            specification.default_open,
            coalesce(
              json_agg(
                json_build_object(
                  'id', item.id,
                  'content', item.content,
                  'sortOrder', item.sort_order
                )
                order by item.sort_order, item.id
              ) filter (where item.id is not null),
              '[]'::json
            ) as items
          from public.project_technical_specifications specification
          left join public.project_technical_specification_items item
            on item.specification_id = specification.id
            and item.deleted_at is null
          where specification.project_id = $1
            and specification.deleted_at is null
          group by specification.id
          order by specification.sort_order, specification.id
        `,
        [projectId],
      ),
      query(
        `
          select
            file.id,
            file.title,
            file.description,
            file.file_type,
            file.current_version,
            version.file_url,
            version.file_extension,
            version.file_size,
            version.created_at
          from public.files file
          left join public.file_versions version
            on version.file_id = file.id
            and version.version_number = file.current_version
            and version.deleted_at is null
          where file.project_id = $1
            and file.deleted_at is null
            and file.status <> 'deleted'
          order by file.created_at desc, file.id desc
        `,
        [projectId],
      ),
    ]);

  return {
    ...toProject(projectResult.rows[0]),
    files: filesResult.rows.map((file) => ({
      createdAt: file.created_at,
      currentVersion: Number(file.current_version),
      description: file.description || null,
      extension: file.file_extension || null,
      fileType: file.file_type,
      fileUrl: file.file_url || null,
      id: Number(file.id),
      size: file.file_size === null ? null : Number(file.file_size),
      title: file.title,
    })),
    requirements: requirementsResult.rows.map((requirement) => ({
      description: requirement.description,
      id: Number(requirement.id),
      sortOrder: Number(requirement.sort_order),
    })),
    technicalSpecifications: specificationsResult.rows.map((specification) => ({
      defaultOpen: Boolean(specification.default_open),
      description: specification.description || null,
      id: Number(specification.id),
      items: Array.isArray(specification.items)
        ? specification.items.map((item) => ({
            ...item,
            id: Number(item.id),
            sortOrder: Number(item.sortOrder),
          }))
        : [],
      sortOrder: Number(specification.sort_order),
      title: specification.title,
    })),
  };
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
        p.location_latitude,
        p.location_longitude,
        p.provider_place_id,
        p.formatted_address,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        architect.email as architect_email,
        architect.first_name as architect_first_name,
        architect.last_name as architect_last_name,
        architect.profile_photo_url as architect_profile_photo_url
      from updated_project p
      inner join public.clients c on c.id = p.client_id
      left join public.users architect on architect.id = p.assigned_architect_id
    `,
    [projectId, isPublic],
  );

  return result.rows[0] ? toProject(result.rows[0]) : null;
}
