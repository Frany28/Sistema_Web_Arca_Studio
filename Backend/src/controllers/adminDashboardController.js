import {
  loadAdminDashboardMetrics,
  loadAdminDashboardOverview,
} from "../services/adminDashboardService.js";

export async function getDashboardMetrics(_req, res, next) {
  try {
    const metrics = await loadAdminDashboardMetrics();

    res.setHeader("Cache-Control", "private, max-age=30, must-revalidate");
    res.status(200).json({ metrics });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardOverview(_req, res, next) {
  try {
    const overview = await loadAdminDashboardOverview();

    res.setHeader("Cache-Control", "private, max-age=30, must-revalidate");
    res.status(200).json({ overview });
  } catch (error) {
    next(error);
  }
}
