import { authConfig } from "../config/auth.js";
import { buildSessionCookie } from "./authController.js";
import * as registrationService from "../services/registrationService.js";

export async function startRegistration(req, res, next) {
  try { res.status(202).json(await registrationService.startRegistration(req.body)); } catch (error) { next(error); }
}

export async function resendRegistration(req, res, next) {
  try { res.status(202).json(await registrationService.resendRegistration(req.body.email)); } catch (error) { next(error); }
}

export async function verifyRegistration(req, res, next) {
  try { res.status(200).json(await registrationService.verifyRegistration(req.body.token)); } catch (error) { next(error); }
}

export async function completeRegistration(req, res, next) {
  try {
    const result = await registrationService.completeRegistration(req.body);
    res.setHeader("Set-Cookie", buildSessionCookie(result.token, authConfig.tokenExpiresInSeconds));
    res.status(201).json(result);
  } catch (error) { next(error); }
}
