import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "arca.image-comments.v1";
const STORAGE_EVENT = "arca:image-comments-updated";
const DEFAULT_PROJECT_ID = "quinta-bella-vista";

function getImageKey(item) {
  return String(item?.id ?? item?.image ?? item?.title ?? "image");
}

function readStoredComments() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredComments(nextComments) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextComments));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  } catch {
    // Comments remain available in memory if localStorage is blocked.
  }
}

function getProjectKey(projectId) {
  return String(projectId ?? DEFAULT_PROJECT_ID);
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

export function getCommentImageKey(item) {
  return getImageKey(item);
}

export function getStoredImageComments() {
  return readStoredComments();
}

export function useImageComments(item, { projectId } = {}) {
  const imageKey = useMemo(() => getImageKey(item), [item]);
  const projectKey = getProjectKey(projectId);
  const [commentsByImage, setCommentsByImage] = useState(() =>
    readStoredComments(),
  );

  const comments = commentsByImage[imageKey] ?? [];

  useEffect(() => {
    function syncComments() {
      setCommentsByImage(readStoredComments());
    }

    window.addEventListener("storage", syncComments);
    window.addEventListener(STORAGE_EVENT, syncComments);

    return () => {
      window.removeEventListener("storage", syncComments);
      window.removeEventListener(STORAGE_EVENT, syncComments);
    };
  }, []);

  const addComment = useCallback(
    ({ message, parentCommentId = null, selection = null }) => {
      const now = new Date().toISOString();
      const comment = {
        id: `image-comment-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        message,
        name: "Tu",
        parentCommentId,
        selection,
        timestamp: "Ahora",
        type: parentCommentId ? "reply" : "comment",
      };
      const storedComments = readStoredComments();
      const next = {
        ...storedComments,
        [imageKey]: [
          ...(storedComments[imageKey] ?? []),
          {
            ...comment,
            createdAt: now,
            image: {
              id: imageKey,
              src: item?.image ?? null,
              title: item?.title ?? item?.label ?? "Imagen",
            },
            projectId: projectKey,
          },
        ],
      };

      setCommentsByImage(next);
      writeStoredComments(next);

      return comment;
    },
    [imageKey, item?.image, item?.label, item?.title, projectKey],
  );

  return {
    addComment,
    comments,
  };
}

export function useImageCommentNotifications({ projectIds = [] } = {}) {
  const projectIdSet = useMemo(
    () => new Set(projectIds.map((projectId) => getProjectKey(projectId))),
    [projectIds],
  );
  const [commentsByImage, setCommentsByImage] = useState(() =>
    readStoredComments(),
  );

  useEffect(() => {
    function syncComments() {
      setCommentsByImage(readStoredComments());
    }

    window.addEventListener("storage", syncComments);
    window.addEventListener(STORAGE_EVENT, syncComments);

    return () => {
      window.removeEventListener("storage", syncComments);
      window.removeEventListener(STORAGE_EVENT, syncComments);
    };
  }, []);

  return useMemo(() => {
    return Object.entries(commentsByImage)
      .flatMap(([imageId, comments]) =>
        (Array.isArray(comments) ? comments : []).map((comment) => ({
          ...comment,
          imageId,
        })),
      )
      .filter((comment) => {
        if (!projectIdSet.size) {
          return false;
        }

        return projectIdSet.has(getProjectKey(comment.projectId));
      })
      .filter((comment) => comment.type === "comment")
      .sort((left, right) => {
        return (
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
        );
      })
      .map((comment) => ({
        ...comment,
        imageComment: true,
        name: comment.name || "Usuario",
        timestamp: getRelativeTimeLabel(comment.createdAt),
      }));
  }, [commentsByImage, projectIdSet]);
}
