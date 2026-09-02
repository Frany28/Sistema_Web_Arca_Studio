import { AppError } from "../errors/appError.js";
import { listProjectRequestsForUser } from "../repositories/projectRequestRepository.js";
import { toPublicProjectRequest } from "./projectRequestService.js";

/**
 * Lista el valor de usuario proyecto solicitudes respetando el alcance y la paginación solicitados.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.cursor - Valor de `options.cursor` requerido por esta operación.
 * @param {number} options.limit - Valor de `options.limit` requerido por esta operación.
 * @param {unknown} options.user - Valor de `options.user` requerido por esta operación.
 * @returns {Promise<object>} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
export async function listUserProjectRequests({ cursor, limit, user }) {
  if (!user?.clientId) {
    throw new AppError({
      code: "CLIENT_REQUIRED",
      message: "Solo los clientes pueden consultar solicitudes de proyecto.",
      status: 403,
    });
  }

  const page = await listProjectRequestsForUser(user, { cursor, limit });
  return { ...page, items: page.items.map(toPublicProjectRequest) };
}
