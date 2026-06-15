import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../../../api/http.js";
import { useAuth } from "../../../auth/AuthContext.jsx";

const LEGACY_STORAGE_KEY = "arca.image-comments.v1";
const MULTIMEDIA_COMMENT_TYPES = new Set(["image", "video", "viewer3d"]);

function getImageKey(item) {
  return String(item?.id ?? item?.image ?? item?.title ?? "image");
}

function clearLegacyStoredComments() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore blocked localStorage; the database remains the source of truth.
  }
}

function getRelativeTimeLabel(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) {
    return "Ahora";
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `Hace ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
}

function getAuthorLabel(comment, user) {
  const author = comment.author;

  const authorId = author?.id == null ? "" : String(author.id);
  const authorEmail = String(author?.email || "")
    .trim()
    .toLowerCase();
  const authorName = String(
    author?.name ||
      [author?.firstName, author?.lastName].filter(Boolean).join(" "),
  )
    .trim()
    .toLowerCase();
  const userId = user?.id == null ? "" : String(user.id);
  const userEmail = String(user?.email || "")
    .trim()
    .toLowerCase();
  const userName = String(
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
  )
    .trim()
    .toLowerCase();

  const isCurrentUser =
    (authorId && userId && authorId === userId) ||
    (authorEmail && userEmail && authorEmail === userEmail) ||
    (authorName && userName && authorName === userName) ||
    comment.name === "Tú" ||
    comment.name === "Tu";

  if (isCurrentUser) {
    return "Tú";
  }

  if (author?.name) {
    return author.roleCode === "architect"
      ? `Arq. ${author.name}`
      : author.name;
  }

  return comment.name || "Usuario";
}

function decorateComment(comment, user) {
  return {
    ...comment,
    imageComment: MULTIMEDIA_COMMENT_TYPES.has(comment.commentType),
    imageId: comment.targetId || comment.imageId,
    message: comment.message ?? comment.content,
    name: getAuthorLabel(comment, user),
    timestamp: getRelativeTimeLabel(comment.createdAt) || comment.timestamp,
  };
}

function normalizeProjectId(projectId) {
  const numericProjectId = Number(projectId);

  return Number.isInteger(numericProjectId) && numericProjectId > 0
    ? numericProjectId
    : null;
}

function isMatchingTarget(comment, { commentType, targetId }) {
  return (
    comment.commentType === commentType && String(comment.targetId) === targetId
  );
}

function useProjectCommentRows(projectIds) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    clearLegacyStoredComments();

    if (projectIds.length === 0) {
      setComments([]);
      return undefined;
    }

    let isMounted = true;

    function loadComments() {
      Promise.all(
        projectIds.map((projectId) => api.projects.listComments({ projectId })),
      )
        .then((responses) => {
          if (isMounted) {
            setComments(
              responses.flatMap((data) =>
                Array.isArray(data.comments) ? data.comments : [],
              ),
            );
          }
        })
        .catch(() => {
          if (isMounted) {
            setComments([]);
          }
        });
    }

    loadComments();
    const refreshInterval = window.setInterval(loadComments, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, [projectIds]);

  return [comments, setComments];
}

export function getCommentImageKey(item) {
  return getImageKey(item);
}

export function getStoredImageComments() {
  clearLegacyStoredComments();
  return {};
}

export function useImageComments(item, { commentType = "image", projectId } = {}) {
  const { user } = useAuth();
  const imageKey = useMemo(() => getImageKey(item), [item]);
  const resolvedProjectId = normalizeProjectId(projectId);
  const projectIds = useMemo(
    () => (resolvedProjectId ? [resolvedProjectId] : []),
    [resolvedProjectId],
  );
  const [projectComments, setProjectComments] = useProjectCommentRows(projectIds);

  const comments = useMemo(
    () =>
      projectComments
        .filter((comment) =>
          isMatchingTarget(comment, { commentType, targetId: imageKey }),
        )
        .map((comment) => decorateComment(comment, user)),
    [commentType, imageKey, projectComments, user],
  );

  const addComment = useCallback(
    async ({ message, parentCommentId = null, selection = null }) => {
      if (!resolvedProjectId) {
        return null;
      }

      const data = await api.projects.createComment({
        commentType,
        content: message,
        image: {
          id: imageKey,
          src: item?.image ?? null,
          title: item?.title ?? item?.label ?? "Imagen",
        },
        parentCommentId,
        projectId: resolvedProjectId,
        selection,
        targetId: imageKey,
      });

      const comment = data?.comment || null;

      if (comment) {
        setProjectComments((current) => [...current, comment]);
      }

      return comment;
    },
    [
      commentType,
      imageKey,
      item?.image,
      item?.label,
      item?.title,
      resolvedProjectId,
      setProjectComments,
    ],
  );

  return {
    addComment,
    comments,
  };
}

export function useImageCommentNotifications({ projectIds = [] } = {}) {
  const { user } = useAuth();
  const projectIdsKey = useMemo(
    () =>
      [
        ...new Set(
          projectIds
            .map(normalizeProjectId)
            .filter((projectId) => Number.isInteger(projectId)),
        ),
      ].join(","),
    [projectIds],
  );
  const normalizedProjectIds = useMemo(
    () =>
      projectIdsKey
        ? projectIdsKey.split(",").map((projectId) => Number(projectId))
        : [],
    [projectIdsKey],
  );
  const [comments] = useProjectCommentRows(normalizedProjectIds);

  return useMemo(() => {
    return comments
      .filter((comment) => MULTIMEDIA_COMMENT_TYPES.has(comment.commentType))
      .sort((left, right) => {
        return (
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
        );
      })
      .map((comment) => decorateComment(comment, user));
  }, [comments, user]);
}
