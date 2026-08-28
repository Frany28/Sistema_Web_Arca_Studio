import { AppError, ConflictError, NotFoundError } from "../errors/appError.js";
import {
  decideProjectRequest as decideProjectRequestRecord,
  listProjectRequestReviewQueue,
  upsertProjectRequestReview,
} from "../repositories/projectRequestWorkflowRepository.js";

export function loadProjectRequestReviewQueue({ cursor, limit, user }) {
  return listProjectRequestReviewQueue({ cursor, limit, user });
}

export async function submitProjectRequestReview({ payload, projectRequestId, user }) {
  const result = await upsertProjectRequestReview({
    note: payload.note,
    projectRequestId,
    recommendation: payload.recommendation,
    reviewerId: user.id,
    reviewerRole: user.role?.code,
  });

  if (!result.targetExists) {
    throw new NotFoundError(
      "PROJECT_REQUEST_NOT_FOUND",
      "Solicitud de proyecto no encontrada.",
    );
  }
  if (result.status !== "pending_review") {
    throw new ConflictError(
      "PROJECT_REQUEST_CLOSED",
      "La solicitud no se encuentra en revisión.",
    );
  }
  if (!result.allowed) {
    throw new AppError({
      code: "PROJECT_REQUEST_REVIEW_FORBIDDEN",
      message: "Solo los arquitectos asignados pueden revisar esta solicitud.",
      status: 403,
    });
  }
  return result.review;
}

export async function applyProjectRequestDecision({
  payload,
  projectRequestId,
  user,
}) {
  const result = await decideProjectRequestRecord({
    action: payload.action,
    internalNotes: payload.internalNotes || null,
    projectRequestId,
    reason: payload.reason || null,
    reviewedBy: user.id,
  });

  if (result.outcome === "not_found") {
    throw new NotFoundError(
      "PROJECT_REQUEST_NOT_FOUND",
      "Solicitud de proyecto no encontrada.",
    );
  }
  if (result.outcome === "invalid_state") {
    throw new ConflictError(
      "PROJECT_REQUEST_INVALID_STATE",
      "Solo se pueden decidir solicitudes que están en revisión.",
    );
  }
  if (result.outcome === "review_required") {
    throw new ConflictError(
      "PROJECT_REQUEST_REVIEW_REQUIRED",
      "Se necesita al menos una revisión registrada por un arquitecto asignado.",
    );
  }
  return result;
}
