function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapAdminDashboardMetrics(row = {}) {
  return {
    activeUsers: {
      thisMonth: toNumber(row.active_users_this_month),
      total: toNumber(row.active_users_total),
    },
    activeProjects: {
      thisMonth: toNumber(row.active_projects_this_month),
      total: toNumber(row.active_projects_total),
    },
    files: {
      latestUploadAt: row.files_latest_upload_at || null,
      total: toNumber(row.files_total),
      totalBytes: toNumber(row.files_total_bytes),
    },
    requests: {
      today: toNumber(row.requests_today),
      total: toNumber(row.requests_total),
    },
    criticalEvents: {
      latestAt: row.latest_critical_event_at || null,
      total: toNumber(row.critical_events_total),
    },
  };
}
