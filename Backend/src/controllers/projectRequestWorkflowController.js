import {
  applyProjectRequestDecision,
  loadProjectRequestReviewQueue,
  submitProjectRequestReview,
} from "../services/projectRequestWorkflowService.js";
import { decodeCursor, parsePageLimit } from "../utils/pagination.js";

export async function listProjectRequestReviews(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const page = await loadProjectRequestReviewQueue({
      cursor: decodeCursor(query.cursor),
      limit: parsePageLimit(query.limit),
      user: req.user,
    });
    res.setHeader("Cache-Control", "private, no-store");
    res.status(200).json({ projectRequests: page.items, nextCursor: page.nextCursor });
  } catch (error) {
    next(error);
  }
}

export async function putProjectRequestReview(req, res, next) {
  try {
    const review = await submitProjectRequestReview({
      payload: req.body,
      projectRequestId: req.params.projectRequestId,
      user: req.user,
    });
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ review });
  } catch (error) {
    next(error);
  }
}

export async function patchProjectRequestDecision(req, res, next) {
  try {
    const result = await applyProjectRequestDecision({
      payload: req.body,
      projectRequestId: req.params.projectRequestId,
      user: req.user,
    });
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      project: result.project,
      projectRequest: result.projectRequest,
    });
  } catch (error) {
    next(error);
  }
}
