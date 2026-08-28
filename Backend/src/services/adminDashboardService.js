import {
  applyAdminProjectBulkAction,
  getAdminDashboardMetrics,
  getAdminDashboardOverview,
  listAdminAssignees,
  replaceProjectAssignees,
  replaceProjectRequestAssignees,
} from "../repositories/adminDashboardRepository.js";
import { NotFoundError, ValidationError } from "../errors/appError.js";
import { assertProjectOperationallyMutable } from "./projectService.js";

export function loadAdminDashboardMetrics() {
  return getAdminDashboardMetrics();
}

export function loadAdminDashboardOverview() {
  return getAdminDashboardOverview();
}

export function loadAdminAssignees() {
  return listAdminAssignees();
}

export async function manageAdminProjects({ action, isPublic, projectIds, userId }) {
  const result = await applyAdminProjectBulkAction({
    action,
    isPublic,
    projectIds,
    userId,
  });

  if (result.outcome === "not_found") {
    throw new NotFoundError(
      "PROJECT_NOT_FOUND",
      "Uno o varios proyectos no existen.",
    );
  }

  if (result.outcome === "visibility_requires_completed") {
    throw new ValidationError(
      "La visibilidad solo puede cambiarse en proyectos finalizados.",
      { projectIds: "Incluye al menos un proyecto no finalizado o archivado." },
    );
  }

  if (result.outcome === "unarchive_requires_archived") {
    throw new ValidationError(
      "Solo se pueden desarchivar proyectos archivados.",
      { projectIds: "Incluye al menos un proyecto que no esta archivado." },
    );
  }

  return result.projects;
}

function assertAssignmentResult(result, notFoundCode, notFoundMessage) {
  if (!result.targetExists) {
    throw new NotFoundError(notFoundCode, notFoundMessage);
  }

  if (!result.allEligible) {
    throw new ValidationError(
      "Solo se pueden asignar usuarios activos con rol de empleado.",
      { assigneeIds: "Incluye al menos un usuario no elegible." },
    );
  }

  return result.assignees;
}

export async function assignEmployeesToProject({
  assigneeIds,
  assignedBy,
  projectId,
}) {
  await assertProjectOperationallyMutable(projectId);
  const result = await replaceProjectAssignees({
    assigneeIds,
    assignedBy,
    projectId,
  });

  return assertAssignmentResult(
    result,
    "PROJECT_NOT_FOUND",
    "Proyecto no encontrado.",
  );
}

export async function assignEmployeesToProjectRequest({
  assigneeIds,
  assignedBy,
  projectRequestId,
}) {
  const result = await replaceProjectRequestAssignees({
    assigneeIds,
    assignedBy,
    projectRequestId,
  });

  return assertAssignmentResult(
    result,
    "PROJECT_REQUEST_NOT_FOUND",
    "Solicitud de proyecto no encontrada.",
  );
}
