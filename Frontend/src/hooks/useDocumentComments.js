import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/http.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { decorateCommentForDisplay } from "../utils/commentDisplay.js";

const CACHE_TTL_MS = 30_000;
const CACHE_MAX_ENTRIES = 50;
const commentCache = new Map();

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

  const comments = useMemo(
    () => rows.map((comment) => ({
      ...decorateCommentForDisplay(comment, user),
      imageComment: true,
      message: comment.content,
      timestamp: "",
    })),
    [rows, user],
  );

  const addComment = useCallback(async ({ message, parentCommentId = null, selection = null }) => {
    if (submitPromiseRef.current) return submitPromiseRef.current;
    const request = api.projects.createComment({
      commentType: "document",
      content: message,
      fileId,
      fileVersionId,
      parentCommentId,
      projectId,
      selection,
    }).then((data) => {
      if (data.comment) {
        setRows((current) => upsert(current, data.comment));
        const cached = commentCache.get(cacheKey);
        commentCache.set(cacheKey, {
          comments: upsert(cached?.comments || [], data.comment),
          createdAt: Date.now(),
          promise: null,
        });
      }
      return data.comment || null;
    }).finally(() => {
      submitPromiseRef.current = null;
    });
    submitPromiseRef.current = request;
    return request;
  }, [cacheKey, fileId, fileVersionId, projectId]);

  return { addComment, comments, error, isLoading };
}
