import {
  canAccessProjectComments,
  createProjectCommentRecord,
  listProjectComments,
} from "../repositories/projectCommentRepository.js";
import { getProjectCommentAuthorProfilePhoto } from "../services/profilePhotoService.js";
import {
  publishProjectEvent,
  subscribeToProjectEvents,
  assertProjectEventCapacity,
} from "../services/projectEvents.js";
import { decodeCursor, parsePageLimit } from "../utils/pagination.js";

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

    const query = req.validatedQuery || req.query;
    const cursor = decodeCursor(query?.cursor);
    if (query?.cursor && !cursor) return res.status(400).json({ code: "INVALID_CURSOR", message: "Cursor inválido." });
    const page = await listProjectComments(projectId, req.user, { cursor, limit: parsePageLimit(query?.limit) });

    res.status(200).json({ comments: page.items, nextCursor: page.nextCursor });
  } catch (error) {
    next(error);
  }
}

export async function streamProjectCommentAuthorProfilePhoto(req, res, next) {
  try {
    const photo = await getProjectCommentAuthorProfilePhoto({
      authorUserId: req.params.userId,
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
        message: "El tipo de observación no es válido.",
      });
      return;
    }

    if (!parentCommentId && commentType !== "general" && !targetId) {
      res.status(400).json({
        code: "COMMENT_TARGET_REQUIRED",
        message: "La observación necesita un recurso asociado.",
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        code: "COMMENT_CONTENT_REQUIRED",
        message: "Escribe una observación.",
      });
      return;
    }

    if (content.length > COMMENT_CONTENT_MAX_LENGTH) {
      res.status(400).json({
        code: "COMMENT_CONTENT_TOO_LONG",
        message: `La observación no puede superar ${COMMENT_CONTENT_MAX_LENGTH} caracteres.`,
      });
      return;
    }

    if (Number.isNaN(parentCommentId)) {
      res.status(400).json({
        code: "INVALID_PARENT_COMMENT_ID",
        message: "La observación a responder no es válida.",
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
        message: "No se encontró el proyecto o la observación a responder.",
      });
      return;
    }

    publishProjectEvent({
      eventName: "project.comment.created",
      payload: { comment },
      projectId,
    });

    res.status(201).json({ comment });
  } catch (error) {
    if (error.code === "23505") {
      res.status(409).json({ code: "COMMENT_CONFLICT", message: "Otra observación fue creada simultáneamente. Intenta de nuevo." });
      return;
    }
    next(error);
  }
}

export async function streamProjectCommentEvents(req, res, next) {
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

    try {
      assertProjectEventCapacity({ projectId, userId: req.user.id });
    } catch (error) {
      if (error.code === "SSE_CONNECTION_LIMIT") {
        res.setHeader("Retry-After", "30");
        res.status(429).json({ code: error.code, message: "Límite de conexiones en tiempo real alcanzado." });
        return;
      }
      throw error;
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    let unsubscribe;
    try {
      unsubscribe = subscribeToProjectEvents({ projectId, response: res, userId: req.user.id });
    } catch (error) {
      if (error.code === "SSE_CONNECTION_LIMIT") {
        res.end();
        return;
      }
      throw error;
    }

    req.on("close", unsubscribe);
  } catch (error) {
    next(error);
  }
}
