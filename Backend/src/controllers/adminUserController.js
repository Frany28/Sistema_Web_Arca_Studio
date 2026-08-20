import { getAdminUsersPage } from "../services/adminUserService.js";

export async function getAdminUsers(req, res, next) {
  try {
    const page = await getAdminUsersPage(req.validatedQuery);

    res.set("Cache-Control", "private, max-age=15");
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
}
