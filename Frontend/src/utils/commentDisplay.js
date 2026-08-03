import { getApiUrl } from "../api/http.js";

export function buildCommentAuthorAvatarUrl(comment) {
  const authorUserId = Number(comment?.author?.id);
  const projectId = Number(comment?.projectId);

  if (
    !comment?.author?.hasProfilePhoto ||
    !Number.isInteger(authorUserId) ||
    authorUserId <= 0 ||
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    return "";
  }

  return getApiUrl(
    `/projects/${projectId}/comment-authors/${authorUserId}/profile-photo`,
  );
}

export function isCommentFromCurrentUser(comment, user) {
  const author = comment?.author;
  const authorId = author?.id == null ? "" : String(author.id);
  const userId = user?.id == null ? "" : String(user.id);

  return Boolean(authorId && userId && authorId === userId);
}

export function getCommentAuthorAvatarSrc(comment, user) {
  if (isCommentFromCurrentUser(comment, user)) {
    return user?.profilePhotoUrl || "";
  }

  return buildCommentAuthorAvatarUrl(comment) || comment?.avatarSrc || "";
}

export const OBSERVATION_TYPE_LABELS = Object.freeze({
  general: "Observación general",
  image: "Observación sobre imagen",
  video: "Observación sobre video",
  panorama: "Observación en panorámica 360",
  document: "Observación sobre documento",
});

export const AUTHOR_ROLE_LABELS = Object.freeze({
  admin: "Administrador",
  architect: "Arquitecto",
  client: "Cliente",
});

export function getCommentAuthorName(comment, user) {
  if (isCommentFromCurrentUser(comment, user)) return "Tú";
  return comment?.author?.name || comment?.name || "Usuario";
}

export function getCommentAuthorRoleLabel(comment, user) {
  const roleCode = isCommentFromCurrentUser(comment, user)
    ? user?.role || user?.roleDetails?.code
    : comment?.author?.roleCode;

  return AUTHOR_ROLE_LABELS[roleCode] || "Usuario";
}

export function getObservationTypeLabel(commentType) {
  return OBSERVATION_TYPE_LABELS[commentType] || OBSERVATION_TYPE_LABELS.general;
}

function getCommentTime(comment) {
  const time = new Date(comment.createdAt || 0).getTime();

  return Number.isNaN(time) ? 0 : time;
}

export function orderCommentsByThread(comments, { limitRootThreads } = {}) {
  const repliesByParent = new Map();
  const rootComments = [];
  const rootIds = new Set();

  comments.forEach((comment) => {
    if (comment.parentCommentId) {
      const key = String(comment.parentCommentId);
      repliesByParent.set(key, [...(repliesByParent.get(key) ?? []), comment]);
      return;
    }

    rootIds.add(String(comment.id));
    rootComments.push(comment);
  });

  const sortedRootComments = [...rootComments].sort((left, right) => {
    const leftReplies = repliesByParent.get(String(left.id)) ?? [];
    const rightReplies = repliesByParent.get(String(right.id)) ?? [];
    const leftTime = Math.max(
      getCommentTime(left),
      ...leftReplies.map(getCommentTime),
    );
    const rightTime = Math.max(
      getCommentTime(right),
      ...rightReplies.map(getCommentTime),
    );

    return rightTime - leftTime;
  });
  const visibleRootComments =
    Number.isInteger(limitRootThreads) && limitRootThreads > 0
      ? sortedRootComments.slice(0, limitRootThreads)
      : sortedRootComments;
  const orderedThreads = visibleRootComments.flatMap((comment) => [
    comment,
    ...(repliesByParent.get(String(comment.id)) ?? []).sort(
      (left, right) => getCommentTime(left) - getCommentTime(right),
    ),
  ]);
  const orphanReplies = comments.filter(
    (comment) =>
      comment.parentCommentId && !rootIds.has(String(comment.parentCommentId)),
  );

  return [
    ...orderedThreads,
    ...orphanReplies.sort(
      (left, right) => getCommentTime(right) - getCommentTime(left),
    ),
  ];
}

export function getProjectNamesById(projects = []) {
  return Object.fromEntries(
    projects
      .filter((project) => project?.id != null)
      .map((project) => [String(project.id), project.name || project.title || "Proyecto"]),
  );
}

export function getCommentableProjectsForUser(projects = [], user) {
  const roleCode = user?.role || user?.roleDetails?.code;

  if (roleCode === "admin") return projects;
  if (roleCode === "architect") {
    return projects.filter(
      (project) => String(project?.assignedArchitect?.id || "") === String(user?.id || ""),
    );
  }
  if (roleCode === "client") {
    return projects.filter(
      (project) => String(project?.client?.id || "") === String(user?.clientId || ""),
    );
  }

  return [];
}

export function decorateCommentForDisplay(comment, user, projectNamesById = {}) {
  return {
    ...comment,
    avatarSrc: getCommentAuthorAvatarSrc(comment, user),
    authorRoleLabel: getCommentAuthorRoleLabel(comment, user),
    name: getCommentAuthorName(comment, user),
    observationTypeLabel: getObservationTypeLabel(comment?.commentType),
    projectName: projectNamesById[String(comment?.projectId)] || "",
  };
}
