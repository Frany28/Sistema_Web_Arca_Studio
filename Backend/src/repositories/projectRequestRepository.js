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
    googlePlaceId: row.google_place_id,
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

export async function createProjectRequestForUser(user, payload) {
  const projectType = normalizeProjectType(payload.selectedProjectTypeId);

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
        verification_code_hash,
        verification_expires_at,
        location_latitude,
        location_longitude,
        google_place_id,
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
        $9,
        now() + interval '15 minutes',
        $10,
        $11,
        $12,
        $13
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
        google_place_id,
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
      hashVerificationCode(payload.code),
      toNullableNumber(payload.projectLocationLatitude),
      toNullableNumber(payload.projectLocationLongitude),
      toNullableString(payload.projectLocationPlaceId),
      toNullableString(payload.projectLocationFormattedAddress),
    ],
  );

  return toProjectRequest(result.rows[0]);
}
