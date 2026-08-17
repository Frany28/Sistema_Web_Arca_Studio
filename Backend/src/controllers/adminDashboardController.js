import {
  assignEmployeesToProject,
  assignEmployeesToProjectRequest,
  loadAdminDashboardMetrics,
  loadAdminDashboardOverview,
  loadAdminAssignees,
} from "../services/adminDashboardService.js";

export async function getAdminAssignees(_req, res, next) {
  try {
    const assignees = await loadAdminAssignees();

    res.setHeader("Cache-Control", "private, max-age=30, must-revalidate");
    res.status(200).json({ assignees });
  } catch (error) {
    next(error);
  }
}

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

export async function updateProjectAssignees(req, res, next) {
  try {
    const assignees = await assignEmployeesToProject({
      assigneeIds: req.body.assigneeIds,
      assignedBy: req.user.id,
      projectId: req.params.projectId,
    });

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ assignees });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectRequestAssignees(req, res, next) {
  try {
    const assignees = await assignEmployeesToProjectRequest({
      assigneeIds: req.body.assigneeIds,
      assignedBy: req.user.id,
      projectRequestId: req.params.projectRequestId,
    });

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ assignees });
  } catch (error) {
    next(error);
  }
}
