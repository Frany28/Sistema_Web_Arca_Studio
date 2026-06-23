import {
  findProjectDetailForUser,
  listProjectsForUser,
  updateProjectVisibility,
} from "../repositories/projectRepository.js";

export async function getMyProjects(req, res, next) {
  try {
    const projects = await listProjectsForUser(req.user);

    res.status(200).json({
      projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectDetail(req, res, next) {
  try {
    const projectId = Number(req.params?.projectId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "Proyecto invalido.",
      });
      return;
    }

    const project = await findProjectDetailForUser(projectId, req.user);

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
