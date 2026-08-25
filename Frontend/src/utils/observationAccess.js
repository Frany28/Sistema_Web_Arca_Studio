function getRoleCode(userOrRoleCode) {
  const roleCode = typeof userOrRoleCode === "string"
    ? userOrRoleCode
    : userOrRoleCode?.roleCode
      || (typeof userOrRoleCode?.role === "string"
        ? userOrRoleCode.role
        : userOrRoleCode?.role?.code)
      || userOrRoleCode?.roleDetails?.code;

  return String(roleCode || "").trim().toLowerCase();
}

export function canAccessObservations(userOrRoleCode) {
  return getRoleCode(userOrRoleCode) !== "admin";
}

export function getEnvironmentNotificationsPolicy(
  userOrRoleCode,
  { activityOnly = false } = {},
) {
  const observationsAllowed = canAccessObservations(userOrRoleCode);

  return {
    activityOnly: activityOnly || !observationsAllowed,
    observationsAllowed: observationsAllowed && !activityOnly,
  };
}
