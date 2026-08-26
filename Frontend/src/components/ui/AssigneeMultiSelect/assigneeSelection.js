export function getRemovedAssignees(currentAssignees = [], nextAssignees = []) {
  const nextIds = new Set(
    nextAssignees.map((assignee) => String(assignee.id)),
  );

  return currentAssignees.filter(
    (assignee) => !nextIds.has(String(assignee.id)),
  );
}
