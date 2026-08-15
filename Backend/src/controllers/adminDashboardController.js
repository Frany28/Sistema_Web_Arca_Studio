import { loadAdminDashboardMetrics } from "../services/adminDashboardService.js";

export async function getDashboardMetrics(_req, res, next) {
  try {
    const metrics = await loadAdminDashboardMetrics();

    res.setHeader("Cache-Control", "private, max-age=30, must-revalidate");
    res.status(200).json({ metrics });
  } catch (error) {
    next(error);
  }
}
