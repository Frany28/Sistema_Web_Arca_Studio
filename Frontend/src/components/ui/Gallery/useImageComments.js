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
  const selection = comment.selection || null;
  const pointNumber =
    comment.commentType === "viewer3d"
      ? Number(comment.pointNumber ?? comment.targetMetadata?.pointNumber) ||
        null
      : null;
  const imageFromSelection = selection?.image || null;
  const image = comment.image || imageFromSelection
    ? {
        ...(imageFromSelection || {}),
        ...(comment.image || {}),
        src:
          comment.image?.src ||
          imageFromSelection?.src ||
          selection?.imageSrc ||
          null,
      }
    : null;

  return {
    ...comment,
    image,
    imageComment: MULTIMEDIA_COMMENT_TYPES.has(comment.commentType),
    imageId: comment.targetId || comment.imageId,
    message: comment.message ?? comment.content,
    name: getAuthorLabel(comment, user),
    pointNumber,
    timestamp: getRelativeTimeLabel(comment.createdAt) || comment.timestamp,
  };
}

function withFallbackPointNumbers(comments) {
  const nextPointNumbersByTarget = new Map();
  const pointNumbersByRootId = new Map();

  const getTargetKey = (comment) =>
    `${comment.commentType || "image"}:${comment.targetId || comment.imageId || "target"}`;

  comments.forEach((comment) => {
    if (
      comment.commentType !== "viewer3d" ||
      comment.parentCommentId ||
      !comment.selection
    ) {
      return;
    }

    const targetKey = getTargetKey(comment);
    const nextPointNumber = nextPointNumbersByTarget.get(targetKey) || 1;
    const pointNumber = comment.pointNumber || nextPointNumber;
    pointNumbersByRootId.set(String(comment.id), pointNumber);
    nextPointNumbersByTarget.set(
      targetKey,
      Math.max(nextPointNumber, pointNumber + 1),
    );
  });

  return comments.map((comment) => {
    if (comment.commentType !== "viewer3d" || comment.pointNumber) {
      return comment;
    }

    const parentPointNumber = comment.parentCommentId
      ? pointNumbersByRootId.get(String(comment.parentCommentId))
      : null;

    if (parentPointNumber) {
      return {
        ...comment,
        pointNumber: parentPointNumber,
      };
    }

    if (!comment.parentCommentId && comment.selection) {
      return {
        ...comment,
        pointNumber: pointNumbersByRootId.get(String(comment.id)) || null,
      };
    }

    return comment;
  });
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

function upsertCommentById(comments, comment) {
  if (!comment?.id) {
    return comments;
  }

  const exists = comments.some((current) => current.id === comment.id);

  return exists
    ? comments.map((current) => (current.id === comment.id ? comment : current))
    : [...comments, comment];
}

function sortCommentsByCreatedAt(comments) {
  return [...comments].sort(
    (left, right) =>
      new Date(left.createdAt || 0).getTime() -
      new Date(right.createdAt || 0).getTime(),
  );
}

function mergeCommentsById(currentComments, nextComments) {
  const commentsById = new Map();

  currentComments.forEach((comment) => {
    if (comment?.id) {
      commentsById.set(String(comment.id), comment);
    }
  });

  nextComments.forEach((comment) => {
    if (comment?.id) {
      commentsById.set(String(comment.id), comment);
    }
  });

  return sortCommentsByCreatedAt(Array.from(commentsById.values()));
}

function useProjectCommentRows(projectIds, { refreshIntervalMs = 0 } = {}) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    clearLegacyStoredComments();

    if (projectIds.length === 0) {
      setComments([]);
      return undefined;
    }

    let isMounted = true;

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

    const unsubscribers = projectIds.map((projectId) =>
      api.projects.subscribeToEvents({
        projectId,
        onCommentCreated: (comment) => {
          if (isMounted) {
            setComments((current) => upsertCommentById(current, comment));
          }
        },
      }),
    );
    const refreshIntervalId =
      refreshIntervalMs > 0
        ? window.setInterval(() => {
            Promise.all(
              projectIds.map((projectId) =>
                api.projects.listComments({ projectId }),
              ),
            )
              .then((responses) => {
                if (isMounted) {
                  setComments((current) =>
                    mergeCommentsById(
                      current,
                      responses.flatMap((data) =>
                        Array.isArray(data.comments) ? data.comments : [],
                      ),
                    ),
                  );
                }
              })
              .catch(() => {});
          }, refreshIntervalMs)
        : null;

    return () => {
      isMounted = false;
      if (refreshIntervalId) {
        window.clearInterval(refreshIntervalId);
      }
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [projectIds, refreshIntervalMs]);

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
      withFallbackPointNumbers(
        projectComments
          .filter((comment) =>
            isMatchingTarget(comment, { commentType, targetId: imageKey }),
          )
          .map((comment) => decorateComment(comment, user)),
      ),
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
        setProjectComments((current) => upsertCommentById(current, comment));
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

export function useImageCommentNotifications({
  projectIds = [],
  refreshIntervalMs = 0,
} = {}) {
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
  const [comments] = useProjectCommentRows(normalizedProjectIds, {
    refreshIntervalMs,
  });

  return useMemo(() => {
    return withFallbackPointNumbers(
      comments
        .filter((comment) => MULTIMEDIA_COMMENT_TYPES.has(comment.commentType))
        .sort((left, right) => {
          return (
            new Date(left.createdAt || 0).getTime() -
            new Date(right.createdAt || 0).getTime()
          );
        })
        .map((comment) => decorateComment(comment, user)),
    ).sort((left, right) => {
        return (
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
        );
      });
  }, [comments, user]);
}
