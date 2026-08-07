import { NotFoundError } from "../errors/appError.js";
import {
  createEnvironmentComment,
  listEnvironmentComments,
} from "../repositories/environmentCommentRepository.js";

export function getEnvironmentComments({ cursor, limit, user }) {
  return listEnvironmentComments(user, { cursor, limit });
}

export async function addEnvironmentComment({
  content,
  parentCommentId,
  user,
}) {
  const comment = await createEnvironmentComment({
    content,
    parentCommentId,
    user,
  });

  if (!comment) {
    throw new NotFoundError(
      "ENVIRONMENT_COMMENT_NOT_FOUND",
      "No se encontró la observación a responder.",
    );
  }

  return comment;
}
