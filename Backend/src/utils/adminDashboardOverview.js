function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapAdminDashboardActivity(row = {}) {
  return {
    createdAt: row.created_at || null,
    id: row.activity_id == null ? null : `${row.activity_kind}-${row.activity_id}`,
    projectId: toNumber(row.project_id),
    projectName: row.project_name || "Proyecto",
    title: row.activity_title || "Actividad registrada",
    userName: row.user_name || "Usuario",
  };
}

export function mapAdminDashboardRequest(row = {}) {
  return {
    createdAt: row.created_at || null,
    id: toNumber(row.id),
    projectName: row.project_name || "Solicitud de proyecto",
    projectType: row.project_type || null,
    status: row.status || null,
  };
}
