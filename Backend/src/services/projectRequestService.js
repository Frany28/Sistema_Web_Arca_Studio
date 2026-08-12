import { AppError, ConflictError, NotFoundError } from "../errors/appError.js";
import { evaluateProjectCompatibility, publicCompatibility } from "../domain/projectRequest.js";
import {
  createProjectRequestDraft,
  findExistingProjectNameForClient,
  findProjectRequestBySubmissionId,
  findProjectRequestOwnedByUser,
  submitProjectRequestForUser,
  updateProjectRequestDraft,
} from "../repositories/projectRequestRepository.js";

function requireClient(user) {
  if (!user?.clientId) {
    throw new AppError({
      code: "CLIENT_REQUIRED",
      message: "Solo los clientes pueden gestionar solicitudes de proyecto.",
      status: 403,
    });
  }
}

export function toPublicProjectRequest(record) {
  const { compatibility, submissionId: _submissionId, ...projectRequest } = record;
  return {
    ...projectRequest,
    compatibility: publicCompatibility(compatibility),
  };
}

async function assertAvailableName(user, payload, excludeProjectRequestId = null) {
  const existing = await findExistingProjectNameForClient(
    user.clientId,
    payload.projectName,
    { excludeProjectRequestId },
  );
  if (existing) {
    throw new ConflictError(
      "PROJECT_NAME_ALREADY_EXISTS",
      "Ya existe un proyecto o solicitud activa con ese nombre.",
    );
  }
}

export async function createProjectRequest({ payload, user }) {
  requireClient(user);
  const idempotentDraft = await findProjectRequestBySubmissionId(payload.submissionId, user);
  if (idempotentDraft) return toPublicProjectRequest(idempotentDraft);

  await assertAvailableName(user, payload);
  try {
    const draft = await createProjectRequestDraft(user, payload);
    return toPublicProjectRequest(draft);
  } catch (error) {
    if (error?.code === "23505") {
      const retryDraft = await findProjectRequestBySubmissionId(payload.submissionId, user);
      if (retryDraft) return toPublicProjectRequest(retryDraft);
      throw new ConflictError(
        "PROJECT_NAME_ALREADY_EXISTS",
        "Ya existe un proyecto o solicitud activa con ese nombre.",
        error,
      );
    }
    throw error;
  }
}

export async function updateProjectRequest({ payload, projectRequestId, user }) {
  requireClient(user);
  const current = await findProjectRequestOwnedByUser(projectRequestId, user);
  if (current?.status === "pending_review") return toPublicProjectRequest(current);
  if (!current || current.status !== "draft") {
    throw new NotFoundError(
      "PROJECT_REQUEST_NOT_FOUND",
      "No se encontró un borrador editable.",
    );
  }
  await assertAvailableName(user, payload, projectRequestId);
  let updated;
  try {
    updated = await updateProjectRequestDraft(projectRequestId, user, payload);
  } catch (error) {
    if (error?.code === "23505") {
      throw new ConflictError(
        "PROJECT_NAME_ALREADY_EXISTS",
        "Ya existe un proyecto o solicitud activa con ese nombre.",
        error,
      );
    }
    throw error;
  }
  if (!updated) {
    throw new NotFoundError(
      "PROJECT_REQUEST_NOT_FOUND",
      "No se encontró un borrador editable.",
    );
  }
  return toPublicProjectRequest(updated);
}

export async function submitProjectRequest({ projectRequestId, user }) {
  requireClient(user);
  const current = await findProjectRequestOwnedByUser(projectRequestId, user);
  if (!current) {
    throw new NotFoundError(
      "PROJECT_REQUEST_NOT_FOUND",
      "No se encontró la solicitud de proyecto.",
    );
  }
  if (current.status === "pending_review" && current.compatibility) {
    return toPublicProjectRequest(current);
  }
  if (current.status !== "draft") {
    throw new AppError({
      code: "PROJECT_REQUEST_NOT_SUBMITTABLE",
      message: "La solicitud no se encuentra en un estado que permita enviarla.",
      status: 409,
    });
  }

  await assertAvailableName(user, current, projectRequestId);
  const evaluation = evaluateProjectCompatibility(current);
  let submitted;
  try {
    submitted = await submitProjectRequestForUser(projectRequestId, user, evaluation);
  } catch (error) {
    if (error?.code === "23505") {
      throw new ConflictError(
        "PROJECT_NAME_ALREADY_EXISTS",
        "Ya existe un proyecto o solicitud activa con ese nombre.",
        error,
      );
    }
    throw error;
  }
  return toPublicProjectRequest(submitted);
}
