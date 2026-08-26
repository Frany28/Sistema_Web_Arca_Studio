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
