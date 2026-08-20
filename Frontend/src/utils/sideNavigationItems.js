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

export function mergeRecentProjectNavigationItems(
  items = [],
  projects = [],
  { includeProjectShortcuts = true } = {},
) {
  const persistentItems = (Array.isArray(items) ? items : []).filter(
    (item) => !String(item?.id || "").startsWith("project-"),
  );

  if (!includeProjectShortcuts) {
    return persistentItems;
  }

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

  if (roleCode === "admin") {
    return [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "admin-dashboard",
        wrapperHeight: "44px",
        to: getDashboardPath(roleCode),
      },
      {
        id: "users",
        label: "Usuarios",
        icon: "users",
        wrapperHeight: "44px",
        to: "/usuarios",
      },
      {
        id: "projects",
        label: "Proyectos",
        icon: "projects",
        wrapperHeight: "44px",
        to: "/proyectos",
      },
      {
        id: "files",
        label: "Archivos",
        icon: "files",
        wrapperHeight: "44px",
        to: "/archivos",
      },
      {
        id: "history",
        label: "Historial",
        icon: "history",
        wrapperHeight: "44px",
        to: "/historial",
      },
      {
        id: "settings",
        label: "Configuraciones",
        icon: "settings",
        wrapperHeight: "44px",
        to: "/configuraciones",
      },
    ];
  }

  return [
    {
      id: "dashboard",
      label: "Dashboard",
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
