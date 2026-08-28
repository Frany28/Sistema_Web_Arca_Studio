import { ConflictError, NotFoundError } from "../errors/appError.js";

export function assertMutableProjectState(project) {
  if (!project) {
    throw new NotFoundError("PROJECT_NOT_FOUND", "Proyecto no encontrado.");
  }

  if (project.status === "archived") {
    throw new ConflictError(
      "PROJECT_ARCHIVED",
      "Desarchiva el proyecto antes de realizar cambios.",
    );
  }

  return project;
}

export function assertOperationallyMutableProjectState(project) {
  const mutableProject = assertMutableProjectState(project);

  if (mutableProject.status === "completed") {
    throw new ConflictError(
      "PROJECT_FINALIZED",
      "El proyecto finalizado es de solo lectura.",
    );
  }

  return mutableProject;
}
