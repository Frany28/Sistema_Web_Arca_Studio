import {
  createAdminUser,
  createAdminUserNote,
  getAdminUserDetails,
  getAdminUserNotesPage,
  getAdminUsersPage,
  updateAdminUserStatus,
  updateAdminUserNote,
} from "../services/adminUserService.js";
import { getAdminUserProfilePhoto } from "../services/profilePhotoService.js";

export async function streamAdminUserProfilePhoto(req, res, next) {
  try {
    const photo = await getAdminUserProfilePhoto({ userId: req.params.userId });

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Type", photo.contentType);
    res.setHeader("Cache-Control", "private, max-age=60, must-revalidate");
    if (photo.contentLength !== undefined) {
      res.setHeader("Content-Length", String(photo.contentLength));
    }
    photo.body.on?.("error", next);
    photo.body.pipe(res.status(200));
  } catch (error) {
    next(error);
  }
}

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

export async function getAdminUser(req, res, next) {
  try {
    const user = await getAdminUserDetails({ actorUserId: req.user.id, userId: req.params.userId });
    res.set("Cache-Control", "no-store");
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function getAdminUserNotes(req, res, next) {
  try {
    const page = await getAdminUserNotesPage({
      actorUserId: req.user.id,
      query: req.validatedQuery,
      userId: req.params.userId,
    });
    res.set("Cache-Control", "no-store");
    res.status(200).json(page);
  } catch (error) { next(error); }
}

export async function postAdminUserNote(req, res, next) {
  try {
    const note = await createAdminUserNote({ actorUserId: req.user.id, content: req.body.content, userId: req.params.userId });
    res.set("Cache-Control", "no-store");
    res.status(201).json({ message: "Nota guardada correctamente.", note });
  } catch (error) { next(error); }
}

export async function patchAdminUserNote(req, res, next) {
  try {
    const note = await updateAdminUserNote({
      actorUserId: req.user.id,
      content: req.body.content,
      noteId: req.params.noteId,
      userId: req.params.userId,
    });
    res.set("Cache-Control", "no-store");
    res.status(200).json({ message: "Nota actualizada correctamente.", note });
  } catch (error) { next(error); }
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
