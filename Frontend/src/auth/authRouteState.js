export function getProtectedRouteDecision({
  allowedRoles,
  isAuthenticated,
  isLoading,
  isSessionUnavailable,
  role,
}) {
  if (isLoading) return "loading";
  if (isSessionUnavailable) return "unavailable";
  if (!isAuthenticated) return "login";
  if (allowedRoles?.length && !allowedRoles.includes(role)) return "role-home";
  return "content";
}
