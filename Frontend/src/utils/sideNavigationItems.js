import { getProjectPath } from "./projectRoutes.js";
import { selectRecentProjects } from "./recentProjects.js";

function createProjectShortcutItems(projects) {
  return selectRecentProjects(projects).map((project) => ({
    id: `project-${project.id}`,
    label: project.name || project.title || "Proyecto",
    icon: "project",
    trailingIcon: project.isPublic ? "window" : undefined,
    wrapperHeight: "56px",
    to: getProjectPath(project),
  }));
}

export function mergeRecentProjectNavigationItems(items = [], projects = []) {
  const persistentItems = (Array.isArray(items) ? items : []).filter(
    (item) => !String(item?.id || "").startsWith("project-"),
  );
  const dashboardIndex = persistentItems.findIndex(
    (item) => item.id === "dashboard",
  );
  const insertIndex = dashboardIndex >= 0 ? dashboardIndex + 1 : 0;

  return [
    ...persistentItems.slice(0, insertIndex),
    ...createProjectShortcutItems(projects),
    ...persistentItems.slice(insertIndex),
  ];
}

export function createUserSideNavigationItems(projects = [], roleCode = "client") {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const isClient = roleCode === "client";

  return [
    {
      id: "dashboard",
      label: "Panel",
      icon: "dashboard",
      wrapperHeight: "44px",
      to: getDashboardPath(roleCode),
    },
    ...createProjectShortcutItems(safeProjects),
    ...(isClient
      ? [
          {
            id: "requests",
            label: "Solicitudes",
            icon: "requests",
            wrapperHeight: "44px",
            to: "/solicitudes",
          },
        ]
      : []),
    {
      id: "more-projects",
      label: "Ver más proyectos",
      icon: "discover",
      wrapperHeight: "56px",
      to: "/proyectos",
    },
    {
      id: "settings",
      label: "Configuraciones",
      icon: "settings",
      wrapperHeight: "56px",
      to: "/configuraciones",
    },
  ];
}

export function getDashboardPath(roleCode) {
  return roleCode === "architect" || roleCode === "admin"
    ? "/dashboard-arquitecto"
    : "/dashboard-clientes";
}
