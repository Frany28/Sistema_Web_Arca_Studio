export const PROJECT_REQUEST_STATUS = {
  approved: { label: "Aprobada", progress: 90 },
  changes_requested: { label: "Requiere correcciones", progress: 40 },
  converted: { label: "Proyecto creado", progress: 100 },
  pending_review: { label: "En revisión", progress: 65 },
  pending_verification: { label: "En verificación", progress: 30 },
  rejected: { label: "Rechazada", progress: 100 },
};

export function getProjectRequestStatus(status) {
  return PROJECT_REQUEST_STATUS[status] || {
    label: "Solicitud enviada",
    progress: 15,
  };
}

export function isProjectRequestEditable(status) {
  return status === "draft" || status === "changes_requested";
}

export function isProjectRequestClosed(status) {
  return ["approved", "converted", "rejected"].includes(status);
}
