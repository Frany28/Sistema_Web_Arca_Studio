import { getApiUrl } from "../api/http.js";

export function getInitialsFromDisplayName(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

export function buildAssignedArchitectAvatarUrl(project) {
  const projectId = Number(project?.id);
  if (!project?.assignedArchitect?.hasProfilePhoto || !Number.isInteger(projectId) || projectId <= 0) return "";

  return getApiUrl(`/projects/${projectId}/assigned-architect/profile-photo`);
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
