import {
  findProjectDetailByPublicSlugForUser,
  findProjectDetailForUser,
  listProjectsForUser,
} from "../repositories/projectRepository.js";

export function listProjects({ cursor = null, limit, scope, user }) {
  return listProjectsForUser(user, {
    cursor,
    directOnly: scope === "owned",
    limit,
  });
}

export function getProjectDetail({
  fileCursor = null,
  fileLimit,
  projectIdentifier,
  user,
}) {
  const numericProjectId = Number(projectIdentifier);
  const usesNumericProjectId =
    Number.isInteger(numericProjectId) && numericProjectId > 0;
  const options = { fileCursor, fileLimit };

  return usesNumericProjectId
    ? findProjectDetailForUser(numericProjectId, user, options)
    : findProjectDetailByPublicSlugForUser(projectIdentifier, user, options);
}
