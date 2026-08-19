import {
  assignEmployeesToProject,
  assignEmployeesToProjectRequest,
  loadAdminDashboardMetrics,
  loadAdminDashboardOverview,
  loadAdminAssignees,
} from "../services/adminDashboardService.js";
import { getAdminAssigneeProfilePhoto } from "../services/profilePhotoService.js";

export async function streamAdminAssigneeProfilePhoto(req, res, next) {
  try {
    const photo = await getAdminAssigneeProfilePhoto({
      userId: req.params.userId,
    });

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Type", photo.contentType);
    res.setHeader("Cache-Control", "private, max-age=60, must-revalidate");
    if (photo.contentLength !== undefined) {
      res.setHeader("Content-Length", String(photo.contentLength));
    }
    photo.body.on?.("error", next);
    photo.body.pipe(res.status(200));
  } catch (error) {
    next(error);
  }
}

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
