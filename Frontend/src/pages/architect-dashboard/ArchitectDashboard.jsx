import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, getAuthToken } from "../../api/http.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getUserDisplay } from "../../auth/userDisplay.js";
import projectImage from "../../assets/fondos/Project Image.png";
import standImage from "../../assets/fondos/Property 1=Variant2.png";
import NavigationBar from "../../components/ui/NavigationBar/NavigationBar.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";
import NotificationsDrawer from "../../components/ui/NotificationsDrawer.jsx";
import SideNavigation from "../../components/ui/SideNavigation/SideNavigation.jsx";
import { useImageCommentNotifications } from "../../components/ui/Gallery/useImageComments.js";
import {
  useProjectComments,
  useRecentProjectComments,
} from "../../hooks/useProjectComments.js";
import { ARCHITECT_DRAWER_RECENT_ACTIVITY } from "./architectDashboardData.js";
import ArchitectProjectGroup from "./components/ArchitectProjectGroup.jsx";

const TABLET_BREAKPOINT_PX = 768;
const PROJECT_IMAGE_POOL = [standImage, projectImage];
const PROJECT_STATUS_GROUPS = [
  {
    id: "in_process",
    status: "En Progreso",
    badgeClassName:
      "border-[var(--color-info-10)] bg-[var(--color-info-10)] text-[var(--color-info-100)]",
  },
  {
    id: "in_review",
    status: "En Revision",
    badgeClassName:
      "border-[var(--color-primary-10)] bg-[var(--color-primary-10)] text-[var(--color-text-300)]",
  },
  {
    id: "pending_approval",
    status: "En espera de Aprobacion",
    badgeClassName:
      "border-[var(--color-neutral-600)] bg-[var(--color-neutral-100)] text-[var(--color-text-300)]",
  },
  {
    id: "finished",
    status: "Finalizados",
    badgeClassName:
      "border-[var(--color-success-10)] bg-[var(--color-success-10)] text-[var(--color-success-200)]",
  },
];

function createNavigationItems(projects) {
  return [
    {
      id: "dashboard",
      label: "Panel",
      icon: "dashboard",
      wrapperHeight: "44px",
    },
    ...projects.slice(0, 2).map((project) => ({
      id: `project-${project.id}`,
      label: project.name,
      icon: "project",
      trailingIcon: project.isPublic ? "window" : undefined,
      wrapperHeight: "56px",
    })),
    {
      id: "more-projects",
      label: "Ver mas proyectos",
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

function toProjectRow(project, index, user) {
  return {
    ...project,
    editable:
      user?.role === "admin" || project.assignedArchitect?.id === user?.id,
    image: PROJECT_IMAGE_POOL[index % PROJECT_IMAGE_POOL.length],
    title: project.name,
  };
}

function groupProjects(projects) {
  const fallbackGroup = PROJECT_STATUS_GROUPS[0];

  return PROJECT_STATUS_GROUPS.map((group) => ({
    ...group,
    projects: projects.filter((project) => project.status === group.id),
  }))
    .concat({
      ...fallbackGroup,
      id: "other",
      projects: projects.filter(
        (project) =>
          !PROJECT_STATUS_GROUPS.some((group) => group.id === project.status),
      ),
      status: "Otros",
    })
    .filter((group) => group.projects.length > 0);
}

function ArchitectDashboard({ empty = false }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentUser = getUserDisplay(user);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsError, setProjectsError] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);
  const canManagePublication =
    user?.permissionCodes?.includes("projects.publish");

  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const formattedTodayLabel =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);
  const projectRows = useMemo(
    () => projects.map((project, index) => toProjectRow(project, index, user)),
    [projects, user],
  );
  const projectGroups = useMemo(
    () => groupProjects(projectRows),
    [projectRows],
  );
  const navigationItems = useMemo(
    () => createNavigationItems(projectRows),
    [projectRows],
  );
  const imageCommentNotifications = useImageCommentNotifications({
    projectIds: [
      ...projectRows.map((project) => project.id),
      "quinta-bella-vista",
    ],
  });
  const commentsProjectId = projectRows[0]?.id ?? null;
  const {
    drawerComments: submittedDrawerComments,
    submitComment,
    refresh: refreshSubmittedComments,
    error: submittedCommentsError,
    loading: submittedCommentsLoading,
  } = useProjectComments({
    enabled: false,
    projectId: commentsProjectId,
    refreshIntervalMs: isNotificationsDrawerOpen ? 5000 : 0,
    user,
  });
  const {
    drawerComments: recentProjectComments,
    error: recentProjectCommentsError,
    loading: recentProjectCommentsLoading,
    refresh: refreshRecentComments,
  } = useRecentProjectComments({
    enabled: projectRows.length > 0,
    projectIds: projectRows.map((project) => project.id),
    refreshIntervalMs: isNotificationsDrawerOpen ? 5000 : 0,
    user,
  });

  const drawerComments = useMemo(() => {
    const commentsById = new Map();

    [...recentProjectComments, ...submittedDrawerComments].forEach(
      (comment) => {
        commentsById.set(String(comment.id), comment);
      },
    );

    return Array.from(commentsById.values());
  }, [recentProjectComments, submittedDrawerComments]);
  const drawerCommentsError = recentProjectCommentsError;
  const drawerCommentsLoading = recentProjectCommentsLoading;
  const notificationComments = useMemo(
    () => [...drawerComments, ...imageCommentNotifications],
    [drawerComments, imageCommentNotifications],
  );

  useEffect(() => {
    if (isNotificationsDrawerOpen) {
      refreshRecentComments?.();
      refreshSubmittedComments?.();
    }
  }, [
    isNotificationsDrawerOpen,
    refreshRecentComments,
    refreshSubmittedComments,
  ]);

  useEffect(() => {
    let isMounted = true;

    setProjectsLoading(true);
    setProjectsError("");

    if (!user) {
      setProjectsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    if (!getAuthToken()) {
      setProjects([]);
      setProjectsError("Vuelve a iniciar sesion para sincronizar la sesion.");
      setProjectsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    api.projects
      .list()
      .then((data) => {
        if (isMounted) {
          setProjects(data.projects || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProjects([]);
          setProjectsError("No se pudieron cargar los proyectos.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setProjectsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${TABLET_BREAKPOINT_PX - 1}px)`,
    );

    function syncSidebarForViewport(event) {
      setIsSidebarExpanded(!event.matches);
    }

    syncSidebarForViewport(mediaQuery);
    mediaQuery.addEventListener("change", syncSidebarForViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncSidebarForViewport);
    };
  }, []);

  const handleSideNavigationSelect = (item) => {
    if (item?.id === "dashboard") {
      navigate("/dashboard-arquitecto");
      return;
    }

    if (item?.id?.startsWith("project-")) {
      navigate("/proyectos/quinta-bella-vista");
      return;
    }

    if (item?.id === "more-projects") {
      navigate("/proyectos/quinta-bella-vista");
      return;
    }

    if (item?.id === "settings") {
      navigate("/configuraciones");
    }
  };

  const handleActivitySelect = (activity) => {
    if (!activity?.to) {
      return;
    }

    setIsNotificationsDrawerOpen(false);
    navigate(activity.to);
  };

  const openImageComment = (comment) => {
    const params = new URLSearchParams({ tab: "renders" });

    if (comment?.imageId) {
      params.set("imageId", comment.imageId);
    }

    if (comment?.id) {
      params.set("commentId", comment.id);
    }

    setIsNotificationsDrawerOpen(false);
    navigate(`/proyectos/quinta-bella-vista?${params.toString()}`);
  };

  const handlePublicationChange = async (project) => {
    const nextIsPublic = !project.isPublic;
    const data = await api.projects.updatePublication({
      isPublic: nextIsPublic,
      projectId: project.id,
    });

    setProjects((currentProjects) =>
      currentProjects.map((currentProject) =>
        currentProject.id === project.id ? data.project : currentProject,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex min-h-screen w-full items-stretch">
        <SideNavigation
          activeItemId="dashboard"
          expanded={isSidebarExpanded}
          items={navigationItems}
          newOpportunityLabel="Nuevo proyecto"
          userName={currentUser.name}
          userEmail={currentUser.email}
          onExpandedChange={setIsSidebarExpanded}
          onItemSelect={handleSideNavigationSelect}
          onNewOpportunityClick={() =>
            navigate("/dashboard-arquitecto/nuevo-proyecto")
          }
          onLogoutClick={() => {
            logout();
            navigate("/");
          }}
          className="min-h-screen shrink-0 self-stretch"
        />

        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col self-stretch overflow-y-auto transition-[width] duration-300 ease-out">
          <NavigationBar
            variant="utility"
            utilityText={formattedTodayLabel}
            utilityActionActive={isNotificationsDrawerOpen}
            onUtilityActionClick={() =>
              setIsNotificationsDrawerOpen((current) => !current)
            }
            className="mx-auto w-full max-w-[1200px] px-[var(--spacing-spacing-gap-8,48px)] py-[var(--spacing-spacing-gap-4,12px)]"
          />

          <div className="mx-auto flex w-full max-w-[1200px] px-[48px] py-[16px]">
            <p className="text-heading-6 w-full text-[var(--color-text-300)]">
              Bienvenido, {currentUser.shortName}
            </p>
          </div>

          {projectsLoading ? (
            <div className="mx-auto flex w-full max-w-[1200px] px-[48px] pb-[48px]">
              <p className="text-body-3 text-[var(--color-text-200)]">
                Cargando proyectos...
              </p>
            </div>
          ) : projectsError ? (
            <div className="mx-auto flex w-full max-w-[1200px] px-[48px] pb-[48px]">
              <p className="text-body-3 text-[var(--color-danger-100)]">
                {projectsError}
              </p>
            </div>
          ) : empty || !projectRows.length ? (
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-center px-[48px] pb-[48px]">
              <EmptyState
                title="Tu espacio de proyectos está listo"
                description="Aquí podrás visualizar y dar seguimiento a tus proyectos."
                secondaryActionLabel="Añadir"
                primaryActionLabel="Actualizar"
                size="S"
                showFeaturedIcon
                showActions
                showSecondaryAction
                className="max-w-[360px]"
              />
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[48px] px-[48px] pb-[48px]">
              {projectGroups.map((group) => (
                <ArchitectProjectGroup
                  key={group.id}
                  canManagePublication={canManagePublication}
                  group={group}
                  onPublicationChange={handlePublicationChange}
                />
              ))}
            </div>
          )}

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
            comments={notificationComments}
            commentsError={drawerCommentsError}
            commentsLoading={drawerCommentsLoading}
            recentActivity={ARCHITECT_DRAWER_RECENT_ACTIVITY}
            onActivitySelect={handleActivitySelect}
            onCommentSelect={openImageComment}
            onSubmitComment={submitComment}
          />
        </div>
      </div>
    </main>
  );
}

export default ArchitectDashboard;
