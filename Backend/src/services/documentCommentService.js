import {
  createDocumentCommentRecord,
  listDocumentComments,
} from "../repositories/projectCommentRepository.js";

/**
 * Crea el comentario de documento con los datos validados recibidos.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {unknown} input - Valor de `input` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function createDocumentComment(input) {
  return createDocumentCommentRecord(input);
}

/**
 * Obtiene los comentarios de documento para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {unknown} input - Valor de `input` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function getDocumentComments(input) {
  return listDocumentComments(input);
}
