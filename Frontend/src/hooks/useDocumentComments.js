import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/http.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { decorateCommentForDisplay } from "../utils/commentDisplay.js";

const CACHE_TTL_MS = 30_000;
const CACHE_MAX_ENTRIES = 50;
const commentCache = new Map();

function isPositiveId(value) {
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue > 0;
}

function isValidDocumentSelection(selection) {
  if (!selection || typeof selection !== "object") return false;
  const hasCoordinates =
    Number.isFinite(selection.normalizedX) &&
    selection.normalizedX >= 0 &&
    selection.normalizedX <= 1 &&
    Number.isFinite(selection.normalizedY) &&
    selection.normalizedY >= 0 &&
    selection.normalizedY <= 1;

  if (!hasCoordinates) return false;
  if (selection.kind === "document-point") {
    return isPositiveId(selection.pageNumber) &&
      isPositiveId(selection.pageCount) &&
      Number(selection.pageNumber) <= Number(selection.pageCount);
  }
  if (selection.kind === "document-section-point") {
    return Number.isInteger(selection.sectionIndex) &&
      selection.sectionIndex >= 0 &&
      isPositiveId(selection.sectionCount) &&
      selection.sectionIndex < Number(selection.sectionCount);
  }
  if (selection.kind === "document-cell-point") {
    return typeof selection.sheetName === "string" &&
      selection.sheetName.trim().length > 0 &&
      /^[A-Z]{1,3}[1-9]\d{0,6}$/.test(selection.cell || "");
  }
  return false;
}

function upsert(comments, comment) {
  return comments.some((item) => String(item.id) === String(comment.id))
    ? comments.map((item) => String(item.id) === String(comment.id) ? comment : item)
    : [...comments, comment];
}

function getCacheKey({ fileId, fileVersionId, projectId, userId }) {
  return `${userId}:${projectId}:${fileId}:${fileVersionId}`;
}

function trimCache() {
  while (commentCache.size > CACHE_MAX_ENTRIES) {
    commentCache.delete(commentCache.keys().next().value);
  }
}

function loadComments(cacheKey, input) {
  const cached = commentCache.get(cacheKey);
  if (cached && (cached.promise || Date.now() - cached.createdAt < CACHE_TTL_MS)) {
    return cached.promise || Promise.resolve(cached.comments);
  }

  const promise = api.projects.listAllDocumentComments(input)
    .then((data) => {
      const comments = data.comments || [];
      commentCache.set(cacheKey, { comments, createdAt: Date.now(), promise: null });
      trimCache();
      return comments;
    })
    .catch((error) => {
      commentCache.delete(cacheKey);
      throw error;
    });
  commentCache.set(cacheKey, { comments: [], createdAt: Date.now(), promise });
  trimCache();
  return promise;
}

export function useDocumentComments({ enabled, fileId, fileVersionId, projectId }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitPromiseRef = useRef(null);
  const cacheKey = getCacheKey({ fileId, fileVersionId, projectId, userId: user?.id || "anonymous" });

  useEffect(() => {
    if (!enabled || !projectId || !fileId || !fileVersionId) {
      queueMicrotask(() => setRows([]));
      return undefined;
    }
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      setRows([]);
      setError("");
      setIsLoading(true);
    });
    loadComments(cacheKey, { fileId, fileVersionId, projectId })
      .then((comments) => mounted && setRows(comments))
      .catch(() => mounted && setError("No se pudieron cargar las observaciones."))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [cacheKey, enabled, fileId, fileVersionId, projectId]);

  const comments = useMemo(() => {
    const replyCounts = new Map();
    const threadParticipants = new Map();
    const decoratedRows = rows.map((comment) => decorateCommentForDisplay(comment, user));

    decoratedRows.forEach((comment) => {
      const rootId = String(comment.parentCommentId || comment.id);
      const authorKey = comment.author?.id != null
        ? `id:${comment.author.id}`
        : `name:${comment.name}`;
      const participants = threadParticipants.get(rootId) || new Map();
      if (!participants.has(authorKey)) {
        participants.set(authorKey, {
          alt: comment.name,
          content: comment.avatarSrc ? "Image" : "Text",
          decorative: false,
          name: comment.name,
          src: comment.avatarSrc,
          theme: "Neutral",
        });
      }
      threadParticipants.set(rootId, participants);

      if (!comment.parentCommentId) return;
      const parentId = String(comment.parentCommentId);
      replyCounts.set(parentId, (replyCounts.get(parentId) || 0) + 1);
    });

    return decoratedRows.map((comment) => ({
      ...comment,
      imageComment: true,
      message: comment.content,
      replyCount: replyCounts.get(String(comment.id)) || 0,
      threadParticipants: Array.from(
        threadParticipants.get(String(comment.parentCommentId || comment.id))?.values() || [],
      ),
      timestamp: "",
    }));
  }, [rows, user]);

  const addComment = useCallback(async ({ message, parentCommentId = null, selection = null }) => {
    if (submitPromiseRef.current) return submitPromiseRef.current;

    const validationError = !isPositiveId(projectId) || !isPositiveId(fileId) || !isPositiveId(fileVersionId)
      ? "No se pudo identificar el documento o su versión."
      : parentCommentId
        ? null
        : isValidDocumentSelection(selection)
          ? null
          : "Selecciona un punto válido en el documento.";

    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    setError("");
    setIsSubmitting(true);
    const request = api.projects.createComment({
      commentType: "document",
      content: message,
      fileId,
      fileVersionId,
      parentCommentId,
      projectId,
      selection,
    }).then((data) => {
      if (!data?.comment?.id) {
        throw new Error("El servidor no devolvió la observación guardada.");
      }

      setRows((current) => upsert(current, data.comment));
      const cached = commentCache.get(cacheKey);
      commentCache.set(cacheKey, {
        comments: upsert(cached?.comments || [], data.comment),
        createdAt: Date.now(),
        promise: null,
      });
      trimCache();
      return data.comment;
    }).catch((requestError) => {
      setError(requestError.message || "No se pudo guardar la observación.");
      throw requestError;
    }).finally(() => {
      submitPromiseRef.current = null;
      setIsSubmitting(false);
    });
    submitPromiseRef.current = request;
    return request;
  }, [cacheKey, fileId, fileVersionId, projectId]);

  return { addComment, comments, error, isLoading, isSubmitting };
}
