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
  if (Number(comment.author?.id) === Number(user?.id)) {
    return "Tú";
  }

  const name = comment.author?.name || "Usuario";

  return comment.author?.roleCode === "architect" ? `Arq. ${name}` : name;
}

function toDrawerComment(comment, user) {
  return {
    id: comment.id,
    message: comment.content,
    name: getCommentAuthorLabel(comment, user),
    createdAt: comment.createdAt,
    parentCommentId: comment.parentCommentId,
    projectId: comment.projectId,
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

export function useProjectComments({ enabled = true, projectId, user }) {
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

    return () => {
      isMounted = false;
    };
  }, [enabled, projectId]);

  const submitComment = useCallback(
    async ({ message, parentCommentId = null }) => {
      if (!projectId) {
        setError("No se encontro el proyecto para comentar.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await api.projects.createComment({
          content: message,
          parentCommentId,
          projectId,
        });

        if (data.comment) {
          setComments((current) => [...current, data.comment]);
        }
      } catch (requestError) {
        setError(requestError.message || "No se pudo guardar el comentario.");
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  const drawerComments = useMemo(
    () => comments.map((comment) => toDrawerComment(comment, user)),
    [comments, user],
  );

  return {
    comments,
    drawerComments,
    error,
    loading,
    submitComment,
  };
}

export function useRecentProjectComments({
  enabled = true,
  projectIds = [],
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

    return () => {
      isMounted = false;
    };
  }, [enabled, normalizedProjectIds]);

  const drawerComments = useMemo(
    () => comments.map((comment) => toDrawerComment(comment, user)),
    [comments, user],
  );

  return {
    comments,
    drawerComments,
    error,
    loading,
  };
}
