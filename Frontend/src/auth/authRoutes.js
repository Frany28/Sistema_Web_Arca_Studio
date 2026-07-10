export function getDefaultAuthenticatedPath(user) {
  if (user?.role === "architect" || user?.role === "admin") {
    return "/dashboard-arquitecto";
  }

  return "/dashboard-clientes";
}
