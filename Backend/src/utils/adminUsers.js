export function mapAdminUser(row = {}) {
  return {
    id: Number(row.id),
    name: [row.first_name, row.last_name].filter(Boolean).join(" ") || row.email,
    email: row.email,
    role: {
      code: row.role_code,
      name: row.role_name,
    },
    status: row.status,
    lastLoginAt: row.last_login_at || null,
    createdAt: row.created_at,
  };
}

export function mapAdminUserMetrics(row = {}) {
  return {
    total: Number(row.total || 0),
    active: Number(row.active || 0),
    suspended: Number(row.suspended || 0),
    disabled: Number(row.disabled || 0),
  };
}
