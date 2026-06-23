import crypto from "node:crypto";

import { query } from "../config/db.js";

const PROJECT_TYPE_MAP = {
  comercial: "commercial",
  corporativo: "corporate",
  residencial: "residential",
  stands: "stands_exhibitions",
};

function toNullableString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function hashVerificationCode(code) {
  return crypto
    .createHash("sha256")
    .update(String(code || crypto.randomUUID()))
    .digest("hex");
}

function toProjectRequest(row) {
  return {
    clientId: Number(row.client_id),
    createdAt: row.created_at,
    description: row.description,
    formattedAddress: row.formatted_address,
    providerPlaceId: row.provider_place_id,
    hasPlans: Boolean(row.has_plans),
    id: Number(row.id),
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
    projectName: row.project_name,
    projectType: row.project_type,
    referenceLink: row.reference_link,
    requestedBy: Number(row.requested_by),
    status: row.status,
  };
}

export function normalizeProjectType(value) {
  return PROJECT_TYPE_MAP[value] || null;
}

export async function findExistingProjectNameForClient(
  clientId,
  projectName,
  options = {},
) {
  const normalizedProjectName = String(projectName || "").trim();
  const excludeProjectRequestId = options.excludeProjectRequestId || null;

  const result = await query(
    `
      select source, id, name, status
      from (
        select
          'project' as source,
          p.id,
          p.name,
          p.status::text as status
        from public.projects p
        where p.client_id = $1
          and p.deleted_at is null
          and p.status <> 'cancelled'
          and lower(p.name) = lower($2)

        union all

        select
          'project_request' as source,
          pr.id,
          pr.project_name as name,
          pr.status::text as status
        from public.project_requests pr
        where pr.client_id = $1
          and pr.deleted_at is null
          and pr.status in ('pending_verification', 'pending_review', 'approved')
          and lower(pr.project_name) = lower($2)
          and ($3::bigint is null or pr.id <> $3::bigint)
      ) existing_names
      limit 1
    `,
    [clientId, normalizedProjectName, excludeProjectRequestId],
  );

  return result.rows[0] || null;
}

export async function findProjectRequestEditableByUser(projectRequestId, user) {
  const result = await query(
    `
      select id, client_id, requested_by, status
      from public.project_requests
      where id = $1
        and client_id = $2
        and requested_by = $3
        and deleted_at is null
        and status in ('pending_verification', 'pending_review')
      limit 1
    `,
    [projectRequestId, user.clientId, user.id],
  );

  return result.rows[0] || null;
}

export async function createProjectRequestForUser(user, payload) {
  const projectType = normalizeProjectType(payload.selectedProjectTypeId);
  const requestStatus =
    payload.prepare === true ? "pending_verification" : "pending_review";

  const result = await query(
    `
      insert into public.project_requests (
        client_id,
        requested_by,
        project_name,
        project_type,
        location,
        description,
        has_plans,
        reference_link,
        status,
        verification_code_hash,
        verification_expires_at,
        location_latitude,
        location_longitude,
        provider_place_id,
        formatted_address
      )
      values (
        $1,
        $2,
        $3,
        $4::project_type,
        $5,
        $6,
        $7,
        $8,
        $9::project_request_status,
        $10,
        now() + interval '15 minutes',
        $11,
        $12,
        $13,
        $14
      )
      returning
        id,
        client_id,
        requested_by,
        project_name,
        project_type,
        location,
        description,
        has_plans,
        reference_link,
        status,
        created_at,
        location_latitude,
        location_longitude,
        provider_place_id,
        formatted_address
    `,
    [
      user.clientId,
      user.id,
      String(payload.projectName || "").trim(),
      projectType,
      String(payload.projectLocation || "").trim(),
      toNullableString(payload.description),
      payload.hasBlueprints === "Yes",
      toNullableString(payload.referenceLink),
      requestStatus,
      hashVerificationCode(payload.code),
      toNullableNumber(payload.projectLocationLatitude),
      toNullableNumber(payload.projectLocationLongitude),
      toNullableString(payload.projectLocationProviderPlaceId),
      toNullableString(payload.projectLocationFormattedAddress),
    ],
  );

  return toProjectRequest(result.rows[0]);
}

export async function updateProjectRequestForUser(projectRequestId, user, payload) {
  const projectType = normalizeProjectType(payload.selectedProjectTypeId);
  const shouldSubmitRequest = payload.prepare !== true;
  const shouldUpdateVerificationCode = Boolean(
    String(payload.code || "").trim(),
  );

  const result = await query(
    `
      update public.project_requests
      set
        project_name = $4,
        project_type = $5::project_type,
        location = $6,
        description = $7,
        has_plans = $8,
        reference_link = $9,
        location_latitude = $10,
        location_longitude = $11,
        provider_place_id = $12,
        formatted_address = $13,
        status = case
          when $16::boolean then 'pending_review'::project_request_status
          else status
        end,
        verification_code_hash = case
          when $14::boolean then $15
          else verification_code_hash
        end,
        verification_expires_at = case
          when $14::boolean then now() + interval '15 minutes'
          else verification_expires_at
        end,
        updated_at = now()
      where id = $1
        and client_id = $2
        and requested_by = $3
        and deleted_at is null
        and status in ('pending_verification', 'pending_review')
      returning
        id,
        client_id,
        requested_by,
        project_name,
        project_type,
        location,
        description,
        has_plans,
        reference_link,
        status,
        created_at,
        location_latitude,
        location_longitude,
        provider_place_id,
        formatted_address
    `,
    [
      projectRequestId,
      user.clientId,
      user.id,
      String(payload.projectName || "").trim(),
      projectType,
      String(payload.projectLocation || "").trim(),
      toNullableString(payload.description),
      payload.hasBlueprints === "Yes",
      toNullableString(payload.referenceLink),
      toNullableNumber(payload.projectLocationLatitude),
      toNullableNumber(payload.projectLocationLongitude),
      toNullableString(payload.projectLocationProviderPlaceId),
      toNullableString(payload.projectLocationFormattedAddress),
      shouldUpdateVerificationCode,
      hashVerificationCode(payload.code),
      shouldSubmitRequest,
    ],
  );

  return result.rows[0] ? toProjectRequest(result.rows[0]) : null;
}
