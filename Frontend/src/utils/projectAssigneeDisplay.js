import { getApiUrl, getAuthToken } from "../api/http.js";

export function getInitialsFromDisplayName(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

export function buildAssignedArchitectAvatarUrl(project) {
  const projectId = Number(project?.id);
  if (!project?.assignedArchitect?.profilePhotoUrl || !Number.isInteger(projectId) || projectId <= 0) return "";

  const params = new URLSearchParams();
  const token = getAuthToken();
  if (token) params.set("access_token", token);
  const query = params.toString();

  return getApiUrl(`/projects/${projectId}/assigned-architect/profile-photo${query ? `?${query}` : ""}`);
}

export function getProjectAssigneeAvatar(project) {
  const architect = project?.assignedArchitect;
  if (!architect) return null;

  const name = architect.name || architect.email || "Arquitecto encargado";
  return {
    alt: name,
    content: "Text",
    decorative: false,
    initials: getInitialsFromDisplayName(name),
    name,
    src: buildAssignedArchitectAvatarUrl(project),
    theme: "Neutral",
  };
}
