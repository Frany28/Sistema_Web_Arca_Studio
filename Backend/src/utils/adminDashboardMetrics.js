/**
 * Transforma el valor de number a la representación pública esperada.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Transforma las métricas del panel administrativo a la representación estable utilizada por la aplicación.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {unknown} [row] - Fila obtenida desde PostgreSQL.
 * @returns {object} Resultado producido por la operación.
 */
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
