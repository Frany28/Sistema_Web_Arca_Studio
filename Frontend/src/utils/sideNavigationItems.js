export function createUserSideNavigationItems(projects = [], roleCode = "client") {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const isClient = roleCode === "client";

  return [
    {
      id: "dashboard",
      label: "Panel",
      icon: "dashboard",
      wrapperHeight: "44px",
    },
    ...safeProjects.slice(0, 2).map((project) => ({
      id: `project-${project.id}`,
      label: project.name || project.title || "Proyecto",
      icon: "project",
      trailingIcon: project.isPublic ? "window" : undefined,
      wrapperHeight: "56px",
    })),
    ...(isClient
      ? [
          {
            id: "requests",
            label: "Solicitudes",
            icon: "requests",
            wrapperHeight: "44px",
          },
        ]
      : []),
    {
      id: "more-projects",
      label: "Ver más proyectos",
      icon: "discover",
      wrapperHeight: "56px",
    },
    {
      id: "settings",
      label: "Configuraciones",
      icon: "settings",
      wrapperHeight: "56px",
    },
  ];
}

export function getDashboardPath(roleCode) {
  return roleCode === "architect" || roleCode === "admin"
    ? "/dashboard-arquitecto"
    : "/dashboard-clientes";
}
