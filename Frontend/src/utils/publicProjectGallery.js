import { getProjectTypeDisplay } from "./projectTypeDisplay.js";

export function normalizeProjectSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function isOwnProject(project, user) {
  const role = user?.role || user?.roleDetails?.code;

  if (role === "client") {
    return Number(project?.client?.id) === Number(user?.clientId);
  }

  if (role === "architect") {
    return (
      Number(project?.assignedArchitect?.id) === Number(user?.id) ||
      (project?.assignees || project?.assignedArchitects)?.some(
        (assignee) => Number(assignee?.id) === Number(user?.id),
      )
    );
  }

  return false;
}

export function getPublicGalleryProjects(projects, user) {
  return (Array.isArray(projects) ? projects : []).filter(
    (project) => project?.isPublic && !isOwnProject(project, user),
  );
}

function getProjectYear(project) {
  const date = project?.startDate || project?.createdAt;
  const year = date ? new Date(date).getFullYear() : null;
  return Number.isFinite(year) ? String(year) : "";
}

export function filterPublicProjects(projects, query) {
  const normalizedQuery = normalizeProjectSearch(query);
  if (!normalizedQuery) return Array.isArray(projects) ? projects : [];

  return projects.filter((project) => {
    const searchable = [
      project?.name,
      project?.title,
      getProjectTypeDisplay(project?.projectType),
      project?.assignedArchitect?.name,
      ...(project?.assignees || project?.assignedArchitects || []).map(
        (assignee) => assignee?.name,
      ),
      getProjectYear(project),
    ]
      .map(normalizeProjectSearch)
      .join(" ");

    return searchable.includes(normalizedQuery);
  });
}

function getProjectTimestamp(project) {
  const value = project?.updatedAt || project?.createdAt;
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function sortPublicProjects(projects, direction = "desc") {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...(Array.isArray(projects) ? projects : [])].sort(
    (left, right) =>
      (getProjectTimestamp(left) - getProjectTimestamp(right)) * multiplier ||
      (Number(left?.id) - Number(right?.id)) * multiplier,
  );
}

