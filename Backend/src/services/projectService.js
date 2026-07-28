import {
  findProjectDetailByPublicSlugForUser,
  findProjectDetailForUser,
} from "../repositories/projectRepository.js";

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
