import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/AuthContext.jsx";

const STORAGE_KEY = "arca.image-comments.v1";
const STORAGE_EVENT = "arca:image-comments-updated";
const DEFAULT_PROJECT_ID = "quinta-bella-vista";

function getImageKey(item) {
  return String(item?.id ?? item?.image ?? item?.title ?? "image");
}

function hasAuthor(comment) {
  return Boolean(
    comment?.author &&
      (comment.author.id || comment.author.email || comment.author.name),
  );
}

function sanitizeStoredComments(value) {
  let changed = false;
  const nextComments = {};

  Object.entries(value && typeof value === "object" ? value : {}).forEach(
    ([imageId, comments]) => {
      if (!Array.isArray(comments)) {
        changed = true;
        return;
      }

      const authoredComments = comments.filter((comment) => hasAuthor(comment));

      if (authoredComments.length !== comments.length) {
        changed = true;
      }

      if (authoredComments.length > 0) {
        nextComments[imageId] = authoredComments;
      }
    },
  );

  return { changed, comments: nextComments };
}

function readStoredComments() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    const { changed, comments } = sanitizeStoredComments(parsed);

    if (changed) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    }

    return comments;
  } catch {
    return {};
  }
}

function writeStoredComments(nextComments) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const { comments } = sanitizeStoredComments(nextComments);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
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

function getStoredAuthor(user) {
  if (!user) {
    return null;
  }

  return {
    email: user.email ?? null,
    id: user.id ?? null,
    name: user.name ?? [user.firstName, user.lastName].filter(Boolean).join(" "),
    roleCode: user.role?.code ?? user.roleCode ?? user.role ?? null,
  };
}

function getAuthorLabel(comment, user) {
  const author = comment.author;

  const authorId = author?.id;
  const authorEmail = author?.email?.toLowerCase?.();
  const authorName = String(author?.name || "").trim().toLowerCase();
  const userId = user?.id;
  const userEmail = user?.email?.toLowerCase?.();
  const userName = String(user?.name || "").trim().toLowerCase();

  const isCurrentUser =
    (authorId && userId && Number(authorId) === Number(userId)) ||
    (authorEmail && userEmail && authorEmail === userEmail) ||
    (authorName && userName && authorName === userName) ||
    comment.name === "Tú" || comment.name === "Tu";

  if (isCurrentUser) {
    return "Tú";
  }

  if (author?.name) {
    return author.roleCode === "architect" ? `Arq. ${author.name}` : author.name;
  }

  return comment.name || "Usuario";
}

function decorateComment(comment, user) {
  return {
    ...comment,
    name: getAuthorLabel(comment, user),
    timestamp: getRelativeTimeLabel(comment.createdAt) || comment.timestamp,
  };
}

export function getCommentImageKey(item) {
  return getImageKey(item);
}

export function getStoredImageComments() {
  return readStoredComments();
}

export function useImageComments(item, { projectId } = {}) {
  const { user } = useAuth();
  const imageKey = useMemo(() => getImageKey(item), [item]);
  const projectKey = getProjectKey(projectId);
  const [commentsByImage, setCommentsByImage] = useState(() =>
    readStoredComments(),
  );

  const comments = useMemo(
    () => (commentsByImage[imageKey] ?? []).map((comment) => decorateComment(comment, user)),
    [commentsByImage, imageKey, user],
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

  const addComment = useCallback(
    ({ message, parentCommentId = null, selection = null }) => {
      const author = getStoredAuthor(user);

      if (!hasAuthor({ author })) {
        return null;
      }

      const now = new Date().toISOString();
      const comment = {
        id: `image-comment-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        message,
        author,
        name: "Tú",
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

      const { comments: sanitizedNext } = sanitizeStoredComments(next);

      setCommentsByImage(sanitizedNext);
      writeStoredComments(sanitizedNext);

      return comment;
    },
    [imageKey, item?.image, item?.label, item?.title, projectKey, user],
  );

  return {
    addComment,
    comments,
  };
}

export function useImageCommentNotifications({ projectIds = [] } = {}) {
  const { user } = useAuth();
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
      .sort((left, right) => {
        return (
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
        );
      })
      .map((comment) => ({
        ...comment,
        imageComment: true,
        name: getAuthorLabel(comment, user),
        timestamp: getRelativeTimeLabel(comment.createdAt),
      }));
  }, [commentsByImage, projectIdSet, user]);
}
