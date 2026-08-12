import { AppError } from "../errors/appError.js";
import { listProjectRequestsForUser } from "../repositories/projectRequestRepository.js";
import { toPublicProjectRequest } from "./projectRequestService.js";

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
