import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/http.js";
import { decorateCommentForDisplay } from "../utils/commentDisplay.js";

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

function toDrawerComment(comment, user, projectNamesById = {}) {
  const commentType = comment.commentType || "general";
  const isEnvironmentComment = comment.scope === "environment";
  const commentId = isEnvironmentComment
    ? `environment:${comment.id}`
    : comment.id;
  const parentCommentId = comment.parentCommentId
    ? isEnvironmentComment
      ? `environment:${comment.parentCommentId}`
      : comment.parentCommentId
    : null;

  return {
    ...decorateCommentForDisplay(comment, user, projectNamesById),
    commentType,
    fileId: comment.fileId,
    fileType: comment.fileType,
    fileVersionId: comment.fileVersionId,
    id: commentId,
    image: comment.image,
    imageComment: ["image", "panorama", "video", "document"].includes(commentType),
    imageId: comment.targetId || comment.imageId,
    message: comment.content,
    pointNumber:
      commentType === "panorama"
        ? Number(comment.pointNumber ?? comment.targetMetadata?.pointNumber) ||
          null
        : null,
    createdAt: comment.createdAt,
    parentCommentId,
    projectId: comment.projectId,
    selection: comment.selection,
    targetId: comment.targetId,
    timestamp: getRelativeTimeLabel(comment.createdAt),
    type: comment.type,
  };
}

function getEnvironmentCommentId(value) {
  const normalizedValue = String(value || "");
  const numericValue = Number(
    normalizedValue.startsWith("environment:")
      ? normalizedValue.slice("environment:".length)
      : normalizedValue,
  );

  return Number.isInteger(numericValue) && numericValue > 0
    ? numericValue
    : null;
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
      .listAllComments({ projectId })
      .then((data) => {
        if (isMounted) {
          setComments(Array.isArray(data.comments) ? data.comments : []);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError.message || "No se pudieron cargar las observaciones.",
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
            .listAllComments({ projectId })
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
              .listAllComments({ projectId })
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
        setError(requestError.message || "No se pudo guardar la observación.");
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
      const data = await api.projects.listAllComments({ projectId });

      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (requestError) {
      setError(
        requestError.message || "No se pudieron cargar las observaciones.",
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
  projectNamesById = {},
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
      const resetId = window.setTimeout(() => {
        setComments([]);
        setError("");
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(resetId);
    }

    let isMounted = true;

    setLoading(true);
    setError("");

    Promise.all(
      normalizedProjectIds.map((projectId) =>
        api.projects.listAllComments({ projectId }),
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
            requestError.message || "No se pudieron cargar las observaciones.",
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
                api.projects.listAllComments({ projectId }),
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
          api.projects.listAllComments({ projectId }),
        ),
      );

      setComments(
        responses.flatMap((data) =>
          Array.isArray(data.comments) ? data.comments : [],
        ),
      );
    } catch (requestError) {
      setError(
        requestError.message || "No se pudieron cargar las observaciones.",
      );
    } finally {
      setLoading(false);
    }
  }, [normalizedProjectIds]);

  const drawerComments = useMemo(
    () =>
      comments.map((comment) => toDrawerComment(comment, user, projectNamesById)),
    [comments, projectNamesById, user],
  );

  return {
    comments,
    drawerComments,
    error,
    loading,
    refresh,
  };
}

export function useEnvironmentComments({
  enabled = true,
  refreshIntervalMs = 0,
  user,
}) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    const data = await api.environmentComments.listAll();
    return Array.isArray(data.comments) ? data.comments : [];
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) return;
      setLoading(true);
      setError("");
    });

    fetchComments()
      .then((nextComments) => {
        if (isMounted) setComments(nextComments);
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError.message || "No se pudieron cargar las observaciones.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const refreshIntervalId =
      refreshIntervalMs > 0
        ? window.setInterval(() => {
            fetchComments()
              .then((nextComments) => {
                if (isMounted) {
                  setComments((current) =>
                    mergeCommentsById(current, nextComments),
                  );
                }
              })
              .catch(() => {});
          }, refreshIntervalMs)
        : null;

    return () => {
      isMounted = false;
      if (refreshIntervalId) window.clearInterval(refreshIntervalId);
    };
  }, [enabled, fetchComments, refreshIntervalMs]);

  const submitComment = useCallback(async (input) => {
    const payload =
      typeof input === "string"
        ? { message: input, parentCommentId: null }
        : input || {};
    const parentCommentId = payload.parentCommentId
      ? getEnvironmentCommentId(payload.parentCommentId)
      : null;

    setLoading(true);
    setError("");

    try {
      const data = await api.environmentComments.create({
        content: payload.message,
        parentCommentId,
      });

      if (data?.comment) {
        setComments((current) => upsertCommentById(current, data.comment));
      }
    } catch (requestError) {
      setError(requestError.message || "No se pudo guardar la observación.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setComments(await fetchComments());
    } catch (requestError) {
      setError(
        requestError.message || "No se pudieron cargar las observaciones.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchComments]);

  const drawerComments = useMemo(
    () => comments.map((comment) => toDrawerComment(comment, user)),
    [comments, user],
  );

  return {
    comments,
    drawerComments,
    error,
    loading,
    refresh,
    submitComment,
  };
}
