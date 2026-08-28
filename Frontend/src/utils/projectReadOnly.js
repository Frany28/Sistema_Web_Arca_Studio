const FINALIZED_PROJECT_STATUSES = new Set(["completed", "finished"]);

export function isProjectFinalized(projectOrStatus) {
  const status = typeof projectOrStatus === "string"
    ? projectOrStatus
    : projectOrStatus?.status;

  return FINALIZED_PROJECT_STATUSES.has(status);
}

export function isProjectOperationallyReadOnly(projectOrStatus) {
  const status = typeof projectOrStatus === "string"
    ? projectOrStatus
    : projectOrStatus?.status;

  return status === "archived" || FINALIZED_PROJECT_STATUSES.has(status);
}

export function getProjectReadOnlyMessage(projectOrStatus) {
  return isProjectFinalized(projectOrStatus)
    ? "El proyecto finalizado es de solo lectura."
    : "Desarchiva el proyecto para realizar cambios.";
}
