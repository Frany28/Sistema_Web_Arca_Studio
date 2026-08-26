import {
  findProjectDetailByPublicSlugForUser,
  findProjectDetailForUser,
  findDirectProjectStateForUser,
  findProjectStateById,
  listProjectsForUser,
  updateProjectVisibility,
} from "../repositories/projectRepository.js";
import { assertMutableProjectState } from "./projectMutationPolicy.js";

export async function assertProjectMutable(
  projectId,
  { findProjectState = findProjectStateById } = {},
) {
  const project = await findProjectState(projectId);
  return assertMutableProjectState(project);
}

export async function changeProjectPublication({ isPublic, projectId, user }) {
  const project = await findDirectProjectStateForUser(projectId, user);
  assertMutableProjectState(project);
  return updateProjectVisibility(projectId, isPublic, user);
}

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
