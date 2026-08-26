export const RECENT_PROJECTS_LIMIT = 3;
export const RECENT_PROJECTS_FETCH_LIMIT = 25;

export function getRecentProjectsScope(roleCode) {
  return roleCode === "client" ? "owned" : "accessible";
}

function getProjectTimestamp(project) {
  const timestamp = new Date(
    project?.updatedAt || project?.createdAt || 0,
  ).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function selectRecentProjects(projects = []) {
  const projectsById = new Map();

  (Array.isArray(projects) ? projects : [])
    .filter((project) => project?.status !== "archived" && !project?.isArchived)
    .forEach((project) => {
    if (project?.id !== undefined && project?.id !== null) {
      projectsById.set(String(project.id), project);
    }
  });

  return Array.from(projectsById.values())
    .sort((left, right) => {
      const timestampDifference =
        getProjectTimestamp(right) - getProjectTimestamp(left);

      if (timestampDifference !== 0) {
        return timestampDifference;
      }

      return Number(right.id || 0) - Number(left.id || 0);
    })
    .slice(0, RECENT_PROJECTS_LIMIT);
}

export function toRecentProjectCacheEntries(projects = []) {
  return selectRecentProjects(projects).map((project) => ({
    id: project.id,
    isPublic: Boolean(project.isPublic),
    name: String(project.name || project.title || "Proyecto"),
    publicSlug: project.publicSlug ? String(project.publicSlug) : null,
    status: project.status ? String(project.status) : null,
    updatedAt: project.updatedAt ? String(project.updatedAt) : null,
  }));
}
