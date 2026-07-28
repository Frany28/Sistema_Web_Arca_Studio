import { query } from "../config/db.js";

function toSettings(row) {
  if (!row) return null;
  return {
    environment: row.environment,
    exposure: Number(row.exposure),
    fileId: Number(row.file_id),
    materialOverrides: row.material_overrides || {},
    profile: row.profile,
    schemaVersion: Number(row.schema_version),
    shadowIntensity: Number(row.shadow_intensity),
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function findRenderSettingsAccess({ fileId, projectId, user }) {
  const result = await query(
    `select file.id, file.file_type, project.client_id, project.assigned_architect_id
       from public.files file
       join public.projects project on project.id = file.project_id
      where file.id = $1 and file.project_id = $2
        and file.deleted_at is null and file.status <> 'deleted'
        and project.deleted_at is null
      limit 1`,
    [fileId, projectId],
  );
  const row = result.rows[0];
  if (!row) return null;
  const role = user?.role?.code;
  const canRead =
    role === "admin" ||
    (role === "architect" &&
      Number(row.assigned_architect_id) === Number(user.id)) ||
    (role === "client" &&
      user.clientId &&
      Number(row.client_id) === Number(user.clientId));
  if (!canRead) return null;
  return {
    canEdit: role === "admin" || role === "architect",
    fileType: row.file_type,
  };
}

export async function getRenderSettings({ fileId, projectId }) {
  const result = await query(
    `select file_id, schema_version, profile, exposure, shadow_intensity,
            environment, material_overrides, updated_at
       from public.model_render_settings
      where file_id = $1 and project_id = $2
      limit 1`,
    [fileId, projectId],
  );
  return toSettings(result.rows[0]);
}

export async function upsertRenderSettings({
  fileId,
  projectId,
  settings,
  userId,
}) {
  const result = await query(
    `insert into public.model_render_settings (
       file_id, project_id, updated_by, schema_version, profile, exposure,
       shadow_intensity, environment, material_overrides
     ) values ($1, $2, $3, 1, $4, $5, $6, $7, $8::jsonb)
     on conflict (file_id) do update set
       updated_by = excluded.updated_by,
       schema_version = excluded.schema_version,
       profile = excluded.profile,
       exposure = excluded.exposure,
       shadow_intensity = excluded.shadow_intensity,
       environment = excluded.environment,
       material_overrides = excluded.material_overrides,
       updated_at = now()
     returning file_id, schema_version, profile, exposure, shadow_intensity,
       environment, material_overrides, updated_at`,
    [
      fileId,
      projectId,
      userId,
      settings.profile,
      settings.exposure,
      settings.shadowIntensity,
      settings.environment,
      JSON.stringify(settings.materialOverrides),
    ],
  );
  return toSettings(result.rows[0]);
}
