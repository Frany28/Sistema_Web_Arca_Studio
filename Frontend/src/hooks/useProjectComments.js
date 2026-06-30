import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/http.js";

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

function getCommentAuthorLabel(comment, user) {
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
    (authorName && userName && authorName === userName);

  if (isCurrentUser) {
    return "Tú";
  }

  const name = author?.name || comment.name || "Usuario";

  return author?.roleCode === "architect" ? `Arq. ${name}` : name;
}

function toDrawerComment(comment, user) {
  const commentType = comment.commentType || "general";

  return {
    commentType,
    id: comment.id,
    image: comment.image,
    imageComment: ["image", "viewer3d", "video"].includes(commentType),
    imageId: comment.targetId || comment.imageId,
    message: comment.content,
    name: getCommentAuthorLabel(comment, user),
    createdAt: comment.createdAt,
    parentCommentId: comment.parentCommentId,
    projectId: comment.projectId,
    selection: comment.selection,
    targetId: comment.targetId,
    timestamp: getRelativeTimeLabel(comment.createdAt),
    type: comment.type,
  };
}

function normalizeProjectIds(projectIds = []) {
  return [
    ...new Set(
      projectIds
        .map((projectId) => Number(projectId))
        .filter((projectId) => Number.isInteger(projectId) && projectId > 0),
    ),
  ];
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

export function useProjectComments({
  enabled = true,
  projectId,
  refreshIntervalMs = 0,
  user,
}) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !projectId) {
      setComments([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    setLoading(true);
    setError("");

    api.projects
      .listComments({ projectId })
      .then((data) => {
        if (isMounted) {
          setComments(Array.isArray(data.comments) ? data.comments : []);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError.message || "No se pudieron cargar los comentarios.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const unsubscribe = api.projects.subscribeToEvents({
      projectId,
      onCommentCreated: (comment) => {
        if (isMounted) {
          setComments((current) => upsertCommentById(current, comment));
        }
      },
      onError: () => {
        if (refreshIntervalMs > 0 && isMounted) {
          api.projects
            .listComments({ projectId })
            .then((data) => {
              if (isMounted) {
                setComments(Array.isArray(data.comments) ? data.comments : []);
              }
            })
            .catch(() => {});
        }
      },
    });
    const refreshIntervalId =
      refreshIntervalMs > 0
        ? window.setInterval(() => {
            api.projects
              .listComments({ projectId })
              .then((data) => {
                if (isMounted) {
                  setComments((current) =>
                    mergeCommentsById(
                      current,
                      Array.isArray(data.comments) ? data.comments : [],
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
      unsubscribe();
    };
  }, [enabled, projectId, refreshIntervalMs]);

  const submitComment = useCallback(
    async (input) => {
      // Support both `submitComment("text")` and `submitComment({ message, parentCommentId })`
      const payload =
        typeof input === "string"
          ? { message: input, parentCommentId: null }
          : input || {};

      const { message, parentCommentId } = payload;
      const targetProjectId =
        payload.projectId == null || payload.projectId === ""
          ? projectId
          : payload.projectId;

      if (!targetProjectId) {
        setError("No se encontro el proyecto para comentar.");
        return;
      }

      const normalizedParent =
        parentCommentId == null || parentCommentId === ""
          ? null
          : Number.isFinite(Number(parentCommentId))
            ? Number(parentCommentId)
            : parentCommentId;

      setLoading(true);
      setError("");

      try {
        const data = await api.projects.createComment({
          commentType: payload.commentType,
          content: message,
          image: payload.image,
          parentCommentId: normalizedParent,
          projectId: targetProjectId,
          selection: payload.selection,
          targetId: payload.targetId,
        });

        if (data && data.comment) {
          setComments((current) => upsertCommentById(current, data.comment));
        }
      } catch (requestError) {
        setError(requestError.message || "No se pudo guardar el comentario.");
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  const refresh = useCallback(async () => {
    if (!projectId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api.projects.listComments({ projectId });

      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (requestError) {
      setError(
        requestError.message || "No se pudieron cargar los comentarios.",
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const drawerComments = useMemo(
    () =>
      comments.map((comment) => toDrawerComment(comment, user)),
    [comments, user],
  );

  return {
    comments,
    drawerComments,
    error,
    loading,
    submitComment,
    refresh,
  };
}

export function useRecentProjectComments({
  enabled = true,
  projectIds = [],
  refreshIntervalMs = 0,
  user,
}) {
  const projectIdsKey = useMemo(
    () => normalizeProjectIds(projectIds).join(","),
    [projectIds],
  );
  const normalizedProjectIds = useMemo(
    () =>
      projectIdsKey
        ? projectIdsKey.split(",").map((projectId) => Number(projectId))
        : [],
    [projectIdsKey],
  );
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || normalizedProjectIds.length === 0) {
      return undefined;
    }

    let isMounted = true;

    setLoading(true);
    setError("");

    Promise.all(
      normalizedProjectIds.map((projectId) =>
        api.projects.listComments({ projectId }),
      ),
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
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError.message || "No se pudieron cargar los comentarios.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const unsubscribers = normalizedProjectIds.map((projectId) =>
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
              normalizedProjectIds.map((projectId) =>
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
  }, [enabled, normalizedProjectIds, refreshIntervalMs]);

  const refresh = useCallback(async () => {
    if (normalizedProjectIds.length === 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const responses = await Promise.all(
        normalizedProjectIds.map((projectId) =>
          api.projects.listComments({ projectId }),
        ),
      );

      setComments(
        responses.flatMap((data) =>
          Array.isArray(data.comments) ? data.comments : [],
        ),
      );
    } catch (requestError) {
      setError(
        requestError.message || "No se pudieron cargar los comentarios.",
      );
    } finally {
      setLoading(false);
    }
  }, [normalizedProjectIds]);

  const drawerComments = useMemo(
    () =>
      comments.map((comment) => toDrawerComment(comment, user)),
    [comments, user],
  );

  return {
    comments,
    drawerComments,
    error,
    loading,
    refresh,
  };
}
