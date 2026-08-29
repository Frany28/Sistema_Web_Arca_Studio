import {
  createAdminUser,
  getAdminUsersPage,
  updateAdminUserStatus,
} from "../services/adminUserService.js";

export async function postAdminUser(req, res, next) {
  try {
    const user = await createAdminUser(req.body);
    res.set("Cache-Control", "no-store");
    res.status(201).json({
      message: user.status === "active"
        ? "Usuario creado. Enviamos un enlace para establecer su contraseña."
        : "Usuario creado correctamente.",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminUsers(req, res, next) {
  try {
    const page = await getAdminUsersPage(req.validatedQuery);

    res.set("Cache-Control", "private, max-age=15");
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
}

export async function patchAdminUserStatus(req, res, next) {
  try {
    const user = await updateAdminUserStatus({
      actorUserId: req.user.id,
      status: req.body.status,
      userId: req.params.userId,
    });
    res.set("Cache-Control", "no-store");
    const statusMessages = {
      active: "Usuario habilitado correctamente.",
      blocked: "Usuario suspendido correctamente.",
      inactive: "Usuario deshabilitado correctamente.",
    };
    res.status(200).json({
      message: statusMessages[user.status],
      user,
    });
  } catch (error) {
    next(error);
  }
}
