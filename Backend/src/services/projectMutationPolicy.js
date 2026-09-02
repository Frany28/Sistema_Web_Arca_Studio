import { ConflictError, NotFoundError } from "../errors/appError.js";

/**
 * Comprueba el valor de mutable proyecto state y rechaza la operación cuando no se cumple.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {unknown} project - Valor de `project` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
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

/**
 * Comprueba el valor de operationally mutable proyecto state y rechaza la operación cuando no se cumple.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {unknown} project - Valor de `project` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
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
