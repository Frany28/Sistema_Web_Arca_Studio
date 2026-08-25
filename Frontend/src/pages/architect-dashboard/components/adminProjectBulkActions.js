const FINALIZED_PROJECT_STATUSES = new Set(["completed", "finished"]);

export function isFinalizedProject(project) {
  return FINALIZED_PROJECT_STATUSES.has(project?.status);
}

export function isArchivedProject(project) {
  return Boolean(
    project?.archived === true
      || project?.isArchived === true
      || project?.archivedAt
      || project?.deletedAt
      || project?.deleted_at,
  );
}

export function getBulkActionAvailability(selectedProjects) {
  const hasSelection = selectedProjects.length > 0;

  return {
    canChangeVisibility:
      hasSelection && selectedProjects.every(isFinalizedProject),
    canArchive: hasSelection,
    canUnarchive:
      hasSelection && selectedProjects.every(isArchivedProject),
  };
}
