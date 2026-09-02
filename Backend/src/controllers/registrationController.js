import { authConfig } from "../config/auth.js";
import { buildSessionCookie } from "../utils/authCookies.js";
import * as registrationService from "../services/registrationService.js";
import { toPublicUser } from "../repositories/userRepository.js";

/**
 * Inicia el valor de registro y conserva el estado necesario para completarlo después.
 * Coordina la solicitud HTTP, delega la lógica y construye la respuesta correspondiente.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @param {import("express").Response} res - Respuesta HTTP utilizada para devolver el resultado.
 * @param {Function} next - Función que entrega errores o continúa la cadena de middlewares.
 * @returns {Promise<void>} Finalización de la operación.
 */
export async function startRegistration(req, res, next) {
  try { res.status(202).json(await registrationService.startRegistration(req.body)); } catch (error) { next(error); }
}

/**
 * Reenvía el valor de registro generando credenciales temporales nuevas cuando corresponde.
 * Coordina la solicitud HTTP, delega la lógica y construye la respuesta correspondiente.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @param {import("express").Response} res - Respuesta HTTP utilizada para devolver el resultado.
 * @param {Function} next - Función que entrega errores o continúa la cadena de middlewares.
 * @returns {Promise<void>} Finalización de la operación.
 */
export async function resendRegistration(req, res, next) {
  try { res.status(202).json(await registrationService.resendRegistration(req.body.email)); } catch (error) { next(error); }
}

/**
 * Verifica el valor de registro y rechaza valores vencidos o inconsistentes.
 * Coordina la solicitud HTTP, delega la lógica y construye la respuesta correspondiente.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @param {import("express").Response} res - Respuesta HTTP utilizada para devolver el resultado.
 * @param {Function} next - Función que entrega errores o continúa la cadena de middlewares.
 * @returns {Promise<void>} Finalización de la operación.
 */
export async function verifyRegistration(req, res, next) {
  try { res.status(200).json(await registrationService.verifyRegistration(req.body.token)); } catch (error) { next(error); }
}

/**
 * Procesa el valor de complete registro para completar la responsabilidad asignada al módulo.
 * Coordina la solicitud HTTP, delega la lógica y construye la respuesta correspondiente.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @param {import("express").Response} res - Respuesta HTTP utilizada para devolver el resultado.
 * @param {Function} next - Función que entrega errores o continúa la cadena de middlewares.
 * @returns {Promise<void>} Finalización de la operación.
 */
export async function completeRegistration(req, res, next) {
  try {
    const result = await registrationService.completeRegistration(req.body);
    res.setHeader("Set-Cookie", buildSessionCookie(result.token, authConfig.tokenExpiresInSeconds));
    res.status(201).json({ user: toPublicUser(result.user) });
  } catch (error) { next(error); }
}
