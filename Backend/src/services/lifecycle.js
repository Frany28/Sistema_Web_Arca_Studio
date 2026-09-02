let shuttingDown = false;

/**
 * Inicia el valor de shutdown y actualiza el estado compartido necesario.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @returns {void} Finalización de la operación.
 */
export function beginShutdown() { shuttingDown = true; }
/**
 * Determina si el valor de shutting down cumple la condición esperada.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @returns {boolean} Resultado producido por la operación.
 */
export function isShuttingDown() { return shuttingDown; }
