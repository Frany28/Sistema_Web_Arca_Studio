export function slugifyProjectName(value) {
  const normalized = String(value || "proyecto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "proyecto";
}

export function getProjectSlug(project) {
  return (
    String(project?.publicSlug || "").trim() ||
    slugifyProjectName(project?.name || project?.title || project?.id)
  );
}

export function getProjectPath(project, search = "") {
  const slug = getProjectSlug(project);
  const query = String(search || "").replace(/^\?/, "");

  return `/proyectos/${slug}${query ? `?${query}` : ""}`;
}

export function findProjectBySlug(projects, slug) {
  const normalizedSlug = String(slug || "").trim().toLowerCase();

  return projects.find((project) => getProjectSlug(project) === normalizedSlug);
}
