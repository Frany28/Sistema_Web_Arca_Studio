import {
  getAdminDashboardMetrics,
  getAdminDashboardOverview,
} from "../repositories/adminDashboardRepository.js";

export function loadAdminDashboardMetrics() {
  return getAdminDashboardMetrics();
}

export function loadAdminDashboardOverview() {
  return getAdminDashboardOverview();
}
