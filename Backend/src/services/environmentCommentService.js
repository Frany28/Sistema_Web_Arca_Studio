import { NotFoundError } from "../errors/appError.js";
import {
  createEnvironmentComment,
  listEnvironmentComments,
} from "../repositories/environmentCommentRepository.js";

/**
 * Obtiene los comentarios de entorno para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.cursor - Valor de `options.cursor` requerido por esta operación.
 * @param {number} options.limit - Valor de `options.limit` requerido por esta operación.
 * @param {unknown} options.user - Valor de `options.user` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function getEnvironmentComments({ cursor, limit, user }) {
  return listEnvironmentComments(user, { cursor, limit });
}

/**
 * Procesa el valor de add entorno comentario para completar la responsabilidad asignada al módulo.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.content - Valor de `options.content` requerido por esta operación.
 * @param {string} options.parentCommentId - Valor de `options.parentCommentId` requerido por esta operación.
 * @param {unknown} options.user - Valor de `options.user` requerido por esta operación.
 * @param {object} [options2] - Valor de `options2` requerido por esta operación.
 * @param {unknown} [options2.createComment] - Valor de `options2.createComment` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
export async function addEnvironmentComment(
  { content, parentCommentId, user },
  { createComment = createEnvironmentComment } = {},
) {
  const comment = await createComment({
    content,
    parentCommentId,
    user,
  });

  if (!comment) {
    throw new NotFoundError(
      "ENVIRONMENT_COMMENT_NOT_FOUND",
      "No se encontró la observación a responder.",
    );
  }

  return comment;
}
