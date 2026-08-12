import {
  createProjectRequest as createProjectRequestService,
  submitProjectRequest as submitProjectRequestService,
  updateProjectRequest as updateProjectRequestService,
} from "../services/projectRequestService.js";
import { listUserProjectRequests } from "../services/projectRequestQueryService.js";
import { decodeCursor, parsePageLimit } from "../utils/pagination.js";

export async function listProjectRequests(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const page = await listUserProjectRequests({
      cursor: decodeCursor(query.cursor),
      limit: parsePageLimit(query.limit),
      user: req.user,
    });
    res.status(200).json({ projectRequests: page.items, nextCursor: page.nextCursor });
  } catch (error) {
    next(error);
  }
}

export async function createProjectRequest(req, res, next) {
  try {
    const projectRequest = await createProjectRequestService({
      payload: req.body,
      user: req.user,
    });
    res.status(201).json({ projectRequest });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectRequest(req, res, next) {
  try {
    const projectRequest = await updateProjectRequestService({
      payload: req.body,
      projectRequestId: req.params.projectRequestId,
      user: req.user,
    });
    res.status(200).json({ projectRequest });
  } catch (error) {
    next(error);
  }
}

export async function submitProjectRequest(req, res, next) {
  try {
    const projectRequest = await submitProjectRequestService({
      projectRequestId: req.params.projectRequestId,
      user: req.user,
    });
    res.status(200).json({ projectRequest });
  } catch (error) {
    next(error);
  }
}
