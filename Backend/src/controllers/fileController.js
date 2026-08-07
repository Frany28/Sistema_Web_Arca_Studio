import {
  deleteProjectFile,
  deleteProjectRequestFile,
  findProjectForFileUpload,
  findProjectRequestForFileUpload,
  findProjectFileForDownload,
  getProjectFileObject,
  uploadProjectFile,
  uploadProjectRequestFile,
} from "../repositories/fileRepository.js";
import { getProjectFileCacheHeaders } from "../utils/projectFileCache.js";
import { runUpload, uploadPolicies } from "../services/fileUploadService.js";
import { getAllowedOrigins } from "../config/cors.js";

export async function uploadProjectRequestAttachment(req, res, next) {
  try {
    const projectRequestId = Number(req.params.projectRequestId);

    if (!Number.isInteger(projectRequestId) || projectRequestId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_REQUEST_ID",
        message: "La solicitud de proyecto no es valida.",
      });
      return;
    }

    const projectRequest = await findProjectRequestForFileUpload(
      projectRequestId,
      req.user,
    );

    if (!projectRequest) {
      res.status(404).json({
        code: "PROJECT_REQUEST_NOT_FOUND",
        message: "No se encontro la solicitud de proyecto.",
      });
      return;
    }

    const file = await runUpload({ req, policy: uploadPolicies.document, operation: (upload) => uploadProjectRequestFile({ ...upload, projectRequestId, user: req.user }) });

    res.status(201).json({ file });
  } catch (error) {
    if (error.code === "DUPLICATE_PROJECT_REQUEST_FILE") {
      res.status(409).json({
        code: error.code,
        message: "Ese archivo ya existe en esta solicitud.",
      });
      return;
    }

    if (error.code === "23505") {
      res.status(409).json({
        code: "DUPLICATE_PROJECT_REQUEST_FILE",
        message: "Ese archivo ya existe en esta solicitud.",
      });
      return;
    }

    next(error);
  }
}

export async function deleteProjectRequestAttachment(req, res, next) {
  try {
    const projectRequestId = Number(req.params.projectRequestId);
    const fileId = Number(req.params.fileId);

    if (!Number.isInteger(projectRequestId) || projectRequestId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_REQUEST_ID",
        message: "La solicitud de proyecto no es valida.",
      });
      return;
    }

    if (!Number.isInteger(fileId) || fileId <= 0) {
      res.status(400).json({
        code: "INVALID_FILE_ID",
        message: "El archivo no es valido.",
      });
      return;
    }

    const deletedFile = await deleteProjectRequestFile({
      fileId,
      projectRequestId,
      user: req.user,
    });

    if (!deletedFile) {
      res.status(404).json({
        code: "FILE_NOT_FOUND",
        message: "No se encontro el archivo en esta solicitud.",
      });
      return;
    }

    res.status(200).json(deletedFile);
  } catch (error) {
    next(error);
  }
}

export async function uploadProjectAttachment(req, res, next) {
  try {
    const projectId = Number(req.params.projectId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "El proyecto no es valido.",
      });
      return;
    }

    const project = await findProjectForFileUpload(projectId, req.user);

    if (!project) {
      res.status(404).json({
        code: "PROJECT_NOT_FOUND",
        message: "No se encontro el proyecto.",
      });
      return;
    }

    const file = await runUpload({ req, policy: uploadPolicies.document, operation: (upload) => uploadProjectFile({ ...upload, projectId, user: req.user }) });

    res.status(201).json({ file });
  } catch (error) {
    if (error.code === "DUPLICATE_PROJECT_FILE" || error.code === "23505") {
      res.status(409).json({
        code: "DUPLICATE_PROJECT_FILE",
        message: "Ese archivo ya existe en este proyecto.",
      });
      return;
    }

    next(error);
  }
}

export async function deleteProjectAttachment(req, res, next) {
  try {
    const projectId = Number(req.params.projectId);
    const fileId = Number(req.params.fileId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "El proyecto no es valido.",
      });
      return;
    }

    if (!Number.isInteger(fileId) || fileId <= 0) {
      res.status(400).json({
        code: "INVALID_FILE_ID",
        message: "El archivo no es valido.",
      });
      return;
    }

    const deletedFile = await deleteProjectFile({
      fileId,
      projectId,
      user: req.user,
    });

    if (!deletedFile) {
      res.status(404).json({
        code: "FILE_NOT_FOUND",
        message: "No se encontro el archivo en este proyecto.",
      });
      return;
    }

    res.status(200).json(deletedFile);
  } catch (error) {
    next(error);
  }
}

export async function streamProjectFile(req, res, next) {
  try {
    const projectId = Number(req.params.projectId);
    const fileId = Number(req.params.fileId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "El proyecto no es valido.",
      });
      return;
    }

    if (!Number.isInteger(fileId) || fileId <= 0) {
      res.status(400).json({
        code: "INVALID_FILE_ID",
        message: "El archivo no es valido.",
      });
      return;
    }

    const file = await findProjectFileForDownload({
      fileId,
      projectId,
      user: req.user,
    });

    if (!file) {
      res.status(404).json({
        code: "FILE_NOT_FOUND",
        message: "No se encontro el archivo.",
      });
      return;
    }

    const cacheHeaders = getProjectFileCacheHeaders({
      currentVersionId: file.currentVersionId,
      fileId: file.id,
      requestedVersionId: req.validatedQuery?.versionId,
    });

    const range = req.headers.range;
    const object = await getProjectFileObject({
      fileName: file.fileName,
      range,
    });
    const contentType = object.ContentType || file.fileType || "application/octet-stream";

    const frameAncestors = getAllowedOrigins().filter((origin) => origin !== "*");
    res.removeHeader("X-Frame-Options");
    res.setHeader(
      "Content-Security-Policy",
      `frame-ancestors 'self' ${frameAncestors.join(" ")}`,
    );
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    if (range && object.ContentRange) {
      res.status(206);
      res.setHeader("Content-Range", object.ContentRange);
      res.setHeader("Accept-Ranges", "bytes");
    } else {
      res.status(200);
      res.setHeader("Accept-Ranges", "bytes");
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", cacheHeaders.cacheControl);
    res.vary("Cookie");
    if (cacheHeaders.etag) {
      res.setHeader("ETag", cacheHeaders.etag);
    }
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.originalName)}"`,
    );

    if (object.ContentLength) {
      res.setHeader("Content-Length", object.ContentLength);
    } else if (!range && file.fileSize) {
      res.setHeader("Content-Length", file.fileSize);
    }

    object.Body.pipe(res);
  } catch (error) {
    next(error);
  }
}
