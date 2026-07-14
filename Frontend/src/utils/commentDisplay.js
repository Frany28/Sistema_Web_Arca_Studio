function normalizeIdentityValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function isCommentFromCurrentUser(comment, user) {
  const author = comment?.author;
  const authorId = author?.id == null ? "" : String(author.id);
  const userId = user?.id == null ? "" : String(user.id);
  const authorName = normalizeIdentityValue(
    author?.name ||
      [author?.firstName, author?.lastName].filter(Boolean).join(" "),
  );
  const userName = normalizeIdentityValue(
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
  );
  const authorEmail = normalizeIdentityValue(author?.email);
  const userEmail = normalizeIdentityValue(user?.email);

  return Boolean(
    (authorId && userId && authorId === userId) ||
      (authorEmail && userEmail && authorEmail === userEmail) ||
      (authorName && userName && authorName === userName),
  );
}

export function getCommentAuthorAvatarSrc(comment, user) {
  if (isCommentFromCurrentUser(comment, user)) {
    return user?.profilePhotoUrl || comment?.author?.profilePhotoUrl || "";
  }

  return comment?.author?.profilePhotoUrl || comment?.avatarSrc || "";
}

export const OBSERVATION_TYPE_LABELS = Object.freeze({
  general: "Observación general",
  image: "Observación sobre imagen",
  video: "Observación sobre video",
  viewer3d: "Observación en modelo 3D",
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
