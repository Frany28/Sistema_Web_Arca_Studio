import {
  findProjectDetailByPublicSlugForUser,
  findProjectDetailForUser,
  listProjectsForUser,
  updateProjectVisibility,
} from "../repositories/projectRepository.js";
import { getAssignedArchitectProfilePhoto } from "../services/profilePhotoService.js";
import { isValidProjectSlug } from "../utils/projectSlug.js";
import { decodeCursor, parsePageLimit } from "../utils/pagination.js";

export async function getMyProjects(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const limit = parsePageLimit(query?.limit);
    const cursor = decodeCursor(query?.cursor);
    if (query?.cursor && !cursor) return res.status(400).json({ code: "INVALID_CURSOR", message: "Cursor inválido." });
    const page = await listProjectsForUser(req.user, { cursor, limit });

    res.status(200).json({
      projects: page.items,
      nextCursor: page.nextCursor,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectDetail(req, res, next) {
  try {
    const projectIdentifier = String(req.params?.projectId || "").trim();
    const projectId = Number(projectIdentifier);
    const usesNumericProjectId =
      Number.isInteger(projectId) && projectId > 0;
    const fileCursor = decodeCursor(req.query?.filesCursor);

    if (req.query?.filesCursor && !fileCursor) {
      res.status(400).json({ code: "INVALID_CURSOR", message: "Cursor de archivos inválido." });
      return;
    }

    if (!usesNumericProjectId && !isValidProjectSlug(projectIdentifier)) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "Proyecto invalido.",
      });
      return;
    }

    const project = usesNumericProjectId
      ? await findProjectDetailForUser(projectId, req.user, { fileCursor, fileLimit: parsePageLimit(req.query?.filesLimit) })
      : await findProjectDetailByPublicSlugForUser(projectIdentifier, req.user, { fileCursor, fileLimit: parsePageLimit(req.query?.filesLimit) });

    if (!project) {
      res.status(404).json({
        code: "PROJECT_NOT_FOUND",
        message: "Proyecto no encontrado.",
      });
      return;
    }

    res.status(200).json({
      project: {
        ...project,
        fileAccessToken: req.session?.token || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function streamAssignedArchitectProfilePhoto(req, res, next) {
  try {
    const photo = await getAssignedArchitectProfilePhoto({
      projectId: req.params.projectId,
      user: req.user,
    });

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

export async function updateProjectPublication(req, res, next) {
  try {
    const projectId = Number(req.params?.projectId);
    const isPublic = req.body?.isPublic;

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "Proyecto invalido.",
      });
      return;
    }

    if (typeof isPublic !== "boolean") {
      res.status(400).json({
        code: "INVALID_PUBLICATION_STATE",
        message: "isPublic debe ser true o false.",
      });
      return;
    }

    const project = await updateProjectVisibility(projectId, isPublic);

    if (!project) {
      res.status(404).json({
        code: "PROJECT_NOT_FOUND",
        message: "Proyecto no encontrado.",
      });
      return;
    }

    res.status(200).json({
      project,
    });
  } catch (error) {
    next(error);
  }
}
