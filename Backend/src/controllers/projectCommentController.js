import {
  canAccessProjectComments,
  createProjectCommentRecord,
  listProjectComments,
} from "../repositories/projectCommentRepository.js";

const COMMENT_CONTENT_MAX_LENGTH = 2000;
const ALLOWED_COMMENT_TYPES = new Set(["general", "image", "video", "viewer3d"]);

function parseProjectId(req) {
  const projectId = Number(req.params.projectId);

  return Number.isInteger(projectId) && projectId > 0 ? projectId : null;
}

function parseParentCommentId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parentCommentId = Number(value);

  return Number.isInteger(parentCommentId) && parentCommentId > 0
    ? parentCommentId
    : Number.NaN;
}

function parseCommentType(value) {
  const commentType = String(value || "general").trim();

  return ALLOWED_COMMENT_TYPES.has(commentType) ? commentType : null;
}

function parseTargetId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value).trim() || null;
}

function parsePlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

export async function getProjectComments(req, res, next) {
  try {
    const projectId = parseProjectId(req);

    if (!projectId) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "Proyecto invalido.",
      });
      return;
    }

    const canAccess = await canAccessProjectComments(projectId, req.user);

    if (!canAccess) {
      res.status(404).json({
        code: "PROJECT_NOT_FOUND",
        message: "Proyecto no encontrado.",
      });
      return;
    }

    const comments = await listProjectComments(projectId, req.user);

    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
}

export async function createProjectComment(req, res, next) {
  try {
    const projectId = parseProjectId(req);

    if (!projectId) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "Proyecto invalido.",
      });
      return;
    }

    const content = String(req.body?.content || "").trim();
    const parentCommentId = parseParentCommentId(req.body?.parentCommentId);
    const commentType = parseCommentType(req.body?.commentType);
    const targetId = parseTargetId(req.body?.targetId);
    const image = parsePlainObject(req.body?.image);
    const selection = parsePlainObject(req.body?.selection);

    if (!commentType) {
      res.status(400).json({
        code: "INVALID_COMMENT_TYPE",
        message: "El tipo de comentario no es valido.",
      });
      return;
    }

    if (!parentCommentId && commentType !== "general" && !targetId) {
      res.status(400).json({
        code: "COMMENT_TARGET_REQUIRED",
        message: "El comentario necesita un recurso asociado.",
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        code: "COMMENT_CONTENT_REQUIRED",
        message: "Escribe un comentario.",
      });
      return;
    }

    if (content.length > COMMENT_CONTENT_MAX_LENGTH) {
      res.status(400).json({
        code: "COMMENT_CONTENT_TOO_LONG",
        message: `El comentario no puede superar ${COMMENT_CONTENT_MAX_LENGTH} caracteres.`,
      });
      return;
    }

    if (Number.isNaN(parentCommentId)) {
      res.status(400).json({
        code: "INVALID_PARENT_COMMENT_ID",
        message: "El comentario a responder no es valido.",
      });
      return;
    }

    const comment = await createProjectCommentRecord({
      commentType,
      content,
      parentCommentId,
      projectId,
      targetId,
      targetMetadata:
        commentType === "general"
          ? null
          : {
              image,
              selection,
            },
      user: req.user,
    });

    if (!comment) {
      res.status(404).json({
        code: "PROJECT_OR_COMMENT_NOT_FOUND",
        message: "No se encontro el proyecto o comentario a responder.",
      });
      return;
    }

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
}
