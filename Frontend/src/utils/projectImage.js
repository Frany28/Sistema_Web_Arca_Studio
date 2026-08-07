import { api } from "../api/http.js";

export function getProjectImageSource(project) {
  if (project?.imageFileId && project?.id) {
    return api.projects.getFileContentUrl({
      fileId: project.imageFileId,
      projectId: project.id,
      versionId: project.imageFileVersionId,
    });
  }
  return project?.image || null;
}
