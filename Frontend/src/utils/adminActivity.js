import { formatRelativeTime } from "./relativeTime.js";

export function toAdminDrawerActivity(activity) {
  const isFileActivity = String(activity?.id || "").startsWith("file-");
  const isCompleted = activity?.title === "Entrega finalizada";

  return {
    id: activity.id,
    name: activity.userName,
    action: isFileActivity
      ? "subió un archivo al proyecto"
      : isCompleted
        ? "finalizó la entrega del proyecto"
        : "actualizó el estado del proyecto",
    projectId: activity.projectId,
    projectName: activity.projectName,
    roleCode: activity.userRoleCode,
    timestamp: formatRelativeTime(activity.createdAt),
    to: activity.projectId ? `/proyectos/${activity.projectId}` : undefined,
    type: "event",
  };
}
