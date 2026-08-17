import {
  getAdminDashboardMetrics,
  getAdminDashboardOverview,
  listAdminAssignees,
  replaceProjectAssignees,
  replaceProjectRequestAssignees,
} from "../repositories/adminDashboardRepository.js";
import { NotFoundError, ValidationError } from "../errors/appError.js";

export function loadAdminDashboardMetrics() {
  return getAdminDashboardMetrics();
}

export function loadAdminDashboardOverview() {
  return getAdminDashboardOverview();
}

export function loadAdminAssignees() {
  return listAdminAssignees();
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
