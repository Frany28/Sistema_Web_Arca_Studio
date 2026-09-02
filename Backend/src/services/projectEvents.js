import { sanitizePublicPayload } from "../utils/publicPayload.js";

const projectClients = new Map();
const userConnectionCounts = new Map();
let eventSequence = 0;

/**
 * Obtiene el valor de proyecto key para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {string} projectId - Valor de `projectId` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function getProjectKey(projectId) {
  return String(projectId);
}

/**
 * Envía el valor de evento y traduce los fallos externos al contrato de errores.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {import("express").Response} response - Respuesta o conexión sobre la que se escribe el resultado.
 * @param {string} eventName - Valor de `eventName` requerido por esta operación.
 * @param {unknown} payload - Datos validados necesarios para completar la operación.
 * @returns {void} Finalización de la operación.
 */
function sendEvent(response, eventName, payload) {
  eventSequence += 1;
  response.write(`id: ${Date.now()}-${eventSequence}\n`);
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(sanitizePublicPayload(payload))}\n\n`);
}

/**
 * Suscribe el valor de to proyecto events y administra el ciclo de vida de la conexión.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.projectId - Valor de `options.projectId` requerido por esta operación.
 * @param {unknown} options.response - Valor de `options.response` requerido por esta operación.
 * @param {string} options.userId - Valor de `options.userId` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
export function subscribeToProjectEvents({ projectId, response, userId }) {
  const projectKey = getProjectKey(projectId);
  const clients = projectClients.get(projectKey) || new Set();
  const userKey = String(userId);
  const perUserLimit = Number(process.env.SSE_MAX_CONNECTIONS_PER_USER || 5);
  const perProjectLimit = Number(process.env.SSE_MAX_CONNECTIONS_PER_PROJECT || 100);

  if ((userConnectionCounts.get(userKey) || 0) >= perUserLimit || clients.size >= perProjectLimit) {
    const error = new Error("SSE connection limit reached");
    error.code = "SSE_CONNECTION_LIMIT";
    throw error;
  }

  clients.add(response);
  projectClients.set(projectKey, clients);
  userConnectionCounts.set(userKey, (userConnectionCounts.get(userKey) || 0) + 1);

  sendEvent(response, "project.connected", {
    projectId: Number(projectId),
    timestamp: new Date().toISOString(),
  });

  const heartbeat = setInterval(() => {
    response.write(": heartbeat\n\n");
  }, 25000);

  let closed = false;
    /**
   * Procesa el valor de unsubscribe para completar la responsabilidad asignada al módulo.
   * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
   *
   * @returns {void} Finalización de la operación.
   */
const unsubscribe = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    clients.delete(response);
    const remaining = Math.max(0, (userConnectionCounts.get(userKey) || 1) - 1);
    if (remaining) userConnectionCounts.set(userKey, remaining);
    else userConnectionCounts.delete(userKey);

    if (clients.size === 0) {
      projectClients.delete(projectKey);
    }
  };
  response.on("error", unsubscribe);
  return unsubscribe;
}

/**
 * Comprueba la capacidad de conexiones de eventos del proyecto y rechaza la operación cuando no se cumple.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.projectId - Valor de `options.projectId` requerido por esta operación.
 * @param {string} options.userId - Valor de `options.userId` requerido por esta operación.
 * @returns {void} Finalización de la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
export function assertProjectEventCapacity({ projectId, userId }) {
  const clients = projectClients.get(getProjectKey(projectId)) || new Set();
  const perUserLimit = Number(process.env.SSE_MAX_CONNECTIONS_PER_USER || 5);
  const perProjectLimit = Number(process.env.SSE_MAX_CONNECTIONS_PER_PROJECT || 100);
  if ((userConnectionCounts.get(String(userId)) || 0) >= perUserLimit || clients.size >= perProjectLimit) {
    const error = new Error("SSE connection limit reached");
    error.code = "SSE_CONNECTION_LIMIT";
    throw error;
  }
}

/**
 * Publica el valor de proyecto evento a todas las conexiones suscritas que sigan activas.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.eventName - Valor de `options.eventName` requerido por esta operación.
 * @param {unknown} options.payload - Valor de `options.payload` requerido por esta operación.
 * @param {string} options.projectId - Valor de `options.projectId` requerido por esta operación.
 * @returns {void} Finalización de la operación.
 */
export function publishProjectEvent({ eventName, payload, projectId }) {
  const clients = projectClients.get(getProjectKey(projectId));

  if (!clients || clients.size === 0) {
    return;
  }

  for (const response of clients) {
    if (!response.destroyed && !response.writableEnded) sendEvent(response, eventName, payload);
  }
}

/**
 * Cierra el valor de all proyecto evento connections y libera los recursos asociados.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @returns {void} Finalización de la operación.
 */
export function closeAllProjectEventConnections() {
  for (const clients of projectClients.values()) {
    for (const response of clients) response.end();
  }
  projectClients.clear();
  userConnectionCounts.clear();
}

export const projectEventBus = {
  close: closeAllProjectEventConnections,
  publish: publishProjectEvent,
  subscribe: subscribeToProjectEvents,
};
