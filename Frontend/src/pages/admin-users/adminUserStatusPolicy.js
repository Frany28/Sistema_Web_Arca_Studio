const ELIGIBLE_STATUSES_BY_TARGET = {
  active: new Set(["blocked", "inactive"]),
  blocked: new Set(["active"]),
  inactive: new Set(["active", "blocked"]),
};

export function getBulkStatusTargets({
  actorUserId,
  selectedUserIds,
  status,
  users,
}) {
  const eligibleStatuses = ELIGIBLE_STATUSES_BY_TARGET[status];
  if (!eligibleStatuses) return [];

  return users.filter((listedUser) => (
    selectedUserIds.has(String(listedUser.id))
    && String(listedUser.id) !== String(actorUserId)
    && eligibleStatuses.has(listedUser.status)
  ));
}

