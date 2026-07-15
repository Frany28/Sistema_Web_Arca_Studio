import NavigationBar from "../components/ui/NavigationBar/NavigationBar.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, getAuthToken } from "../api/http.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { getUserDisplay } from "../auth/userDisplay.js";
import AvatarGroup from "../components/ui/AvatarGroup/AvatarGroup.jsx";
import Button from "../components/ui/Button/Button.jsx";
import NotificationsDrawer from "../components/ui/NotificationsDrawer.jsx";
import ProjectRequestModal from "../components/ui/ProjectRequestModal.jsx";
import ProjectsShowcaseCarousel from "../components/ui/ProjectsShowcaseCarousel.jsx";
import ScrollBar from "../components/ui/ScrollBar/ScrollBar.jsx";
import SideNavigation from "../components/ui/SideNavigation/SideNavigation.jsx";
import Tooltip from "../components/ui/Tooltip/Tooltip.jsx";
import fondoActualizarcontraseña from "../assets/fondos/Property 1=actualizar contraseña.png";
import fondoNotificacion from "../assets/fondos/Property 1=notificacion.png";
import fondoRestablecercontraseña from "../assets/fondos/Property 1=restablecer contraseña.png";
import fondoVariante2 from "../assets/fondos/Property 1=Variant2.png";
import { useImageCommentNotifications } from "../components/ui/Gallery/useImageComments.js";
import {
  useProjectComments,
  useRecentProjectComments,
} from "../hooks/useProjectComments.js";
import { getProjectNamesById } from "../utils/commentDisplay.js";
import { getProjectPath } from "../utils/projectRoutes.js";
import { getProjectAssigneeAvatar } from "../utils/projectAssigneeDisplay.js";
import { CLIENT_DRAWER_RECENT_ACTIVITY } from "./clientDrawerData.js";

const EXPANDED_SIDEBAR_WIDTH = 312;
const COLLAPSED_SIDEBAR_WIDTH = 76;
const TABLET_BREAKPOINT_PX = 768;
const PROJECT_IMAGE_POOL = [fondoVariante2, fondoNotificacion];

function mergeNotificationComments(comments) {
  const commentsById = new Map();

  comments.forEach((comment) => {
    if (comment?.id) {
      commentsById.set(String(comment.id), comment);
    }
  });

  return Array.from(commentsById.values());
}

const PROJECT_SHOWCASE_ITEMS = [
  {
    id: "aura-stand-1",
    title: "Stand Aura 2026",
    image: fondoVariante2,
  },
  {
    id: "aura-kitchen-1",
    title: "Stand Aura 2026",
    image: fondoNotificacion,
  },
  {
    id: "aura-bathroom-1",
    title: "Stand Aura 2026",
    image: fondoActualizarcontraseña,
  },
  {
    id: "aura-living-1",
    title: "Stand Aura 2026",
    image: fondoRestablecercontraseña,
  },
  {
    id: "aura-kitchen-2",
    title: "Stand Aura 2026",
    image: fondoNotificacion,
  },
  {
    id: "aura-bathroom-2",
    title: "Stand Aura 2026",
    image: fondoActualizarcontraseña,
  },
  {
    id: "aura-stand-2",
    title: "Stand Aura 2026",
    image: fondoVariante2,
  },
  {
    id: "aura-kitchen-3",
    title: "Stand Aura 2026",
    image: fondoNotificacion,
  },
  {
    id: "aura-bathroom-3",
    title: "Stand Aura 2026",
    image: fondoActualizarcontraseña,
  },
  {
    id: "aura-living-2",
    title: "Stand Aura 2026",
    image: fondoRestablecercontraseña,
  },
  {
    id: "aura-kitchen-4",
    title: "Stand Aura 2026",
    image: fondoNotificacion,
  },
  {
    id: "aura-bathroom-4",
    title: "Stand Aura 2026",
    image: fondoActualizarcontraseña,
  },
];

function createProjectNavigationItems(projects) {
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

function getProjectAssigneeAvatars(project) {
  const assigneeAvatar = getProjectAssigneeAvatar(project);
  return assigneeAvatar ? [assigneeAvatar] : [];
}

function toProjectRow(project, index) {
  return {
    ...project,
    assigneeAvatars: getProjectAssigneeAvatars(project),
    image:
      project.image || PROJECT_IMAGE_POOL[index % PROJECT_IMAGE_POOL.length],
    title: project.name,
  };
}

function ProjectRow({ project }) {
  const navigate = useNavigate();

  return (
    <article className="flex items-center gap-[24px] border-b border-[var(--color-neutral-200)] px-0 py-[16px]">
      <div className="h-[80px] w-[140px] shrink-0 overflow-hidden rounded-[var(--radius-2)]">
        <img
          src={project.image}
          alt={project.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="text-heading-4 text-[var(--color-text-50)]">
            {project.name}
          </h2>
          {project.assigneeAvatars.length ? (
            <Tooltip text={project.assigneeAvatars[0].name} tipPosition="Top center">
              <AvatarGroup size="S" items={project.assigneeAvatars} tabIndex={0} />
            </Tooltip>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-[24px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[2px] border-t-[4px] border-[var(--color-accent-300)] pt-[12px]">
            <p className="text-body-3 text-[var(--color-text-200)]">
              Levantamiento
            </p>
            <p className="text-body-4 text-[var(--color-text-100)]">
              Completado
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[2px] border-t-[4px] border-[var(--color-accent-300)] pt-[12px]">
            <p className="text-body-3 text-[var(--color-text-300)]">Diseño</p>
            <p className="text-body-4 text-[var(--color-text-300)]">
              En proceso
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[2px] border-t-[4px] border-[var(--color-neutral-200)] pt-[12px]">
            <p className="text-body-3 text-[var(--color-text-100)]">
              Ejecución
            </p>
            <p className="text-body-4 text-[var(--color-neutral-400)]">
              Pendiente
            </p>
          </div>
        </div>
      </div>

      <Button
        theme="Primary"
        type="Solid"
        size="M"
        fitContent
        showLeftIcon={false}
        showRightIcon={false}
        className="shrink-0"
        onClick={() => navigate(getProjectPath(project))}
      >
        Ver Proyecto
      </Button>
    </article>
  );
}

function Home() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentUser = getUserDisplay(user);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [isProjectRequestModalOpen, setIsProjectRequestModalOpen] =
    useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollLength, setScrollLength] = useState(1);
  const [projects, setProjects] = useState([]);
  const [projectsError, setProjectsError] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);
  const projectsContainerRef = useRef(null);
  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const formattedTodayLabel =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);
  const projectRows = useMemo(
    () => projects.map((project, index) => toProjectRow(project, index)),
    [projects],
  );
  const ownedProjectRows = useMemo(
    () =>
      projectRows.filter((project) => project.client?.id === user?.clientId),
    [projectRows, user?.clientId],
  );
  const publicProjectRows = useMemo(
    () =>
      projectRows.filter(
        (project) => project.isPublic && project.client?.id !== user?.clientId,
      ),
    [projectRows, user?.clientId],
  );
  const navigationItems = useMemo(
    () => createProjectNavigationItems(ownedProjectRows),
    [ownedProjectRows],
  );
  const imageCommentNotifications = useImageCommentNotifications({
    projectIds: ownedProjectRows.map((project) => project.id),
    projectNamesById: getProjectNamesById(ownedProjectRows),
    refreshIntervalMs: isNotificationsDrawerOpen ? 5000 : 15000,
  });
  const commentsProjectId = ownedProjectRows[0]?.id ?? null;
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
    enabled: ownedProjectRows.length > 0,
    projectIds: ownedProjectRows.map((project) => project.id),
    projectNamesById: getProjectNamesById(ownedProjectRows),
    refreshIntervalMs: isNotificationsDrawerOpen ? 5000 : 15000,
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
  const drawerCommentsError =
    recentProjectCommentsError || submittedCommentsError;
  const drawerCommentsLoading =
    recentProjectCommentsLoading || submittedCommentsLoading;
  const notificationComments = useMemo(
    () => mergeNotificationComments([...drawerComments, ...imageCommentNotifications]),
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
      setProjectsError("Vuelve a iniciar sesión para sincronizar la sesión.");
      setProjectsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    api.projects
      .listAll()
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
    const container = projectsContainerRef.current;

    if (!container) {
      return;
    }

    const maxScroll = Math.max(
      container.scrollHeight - container.clientHeight,
      0,
    );
    container.scrollTo({
      top: maxScroll * scrollPosition,
      behavior: "auto",
    });
  }, [scrollPosition]);

  useEffect(() => {
    const container = projectsContainerRef.current;

    if (!container) {
      return undefined;
    }

    function syncScrollMetrics() {
      const nextLength = Math.min(
        container.clientHeight / Math.max(container.scrollHeight, 1),
        1,
      );
      const maxScroll = Math.max(
        container.scrollHeight - container.clientHeight,
        1,
      );
      setScrollLength(nextLength);
      setScrollPosition(container.scrollTop / maxScroll);
    }

    syncScrollMetrics();
    window.addEventListener("resize", syncScrollMetrics);

    return () => {
      window.removeEventListener("resize", syncScrollMetrics);
    };
  }, [ownedProjectRows.length]);

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
      navigate("/dashboard-clientes");
      return;
    }

    if (item?.id?.startsWith("project-")) {
      const projectId = Number(item.id.replace("project-", ""));

      if (Number.isInteger(projectId)) {
        const selectedProject = ownedProjectRows.find(
          (project) => project.id === projectId,
        );

        navigate(
          selectedProject ? getProjectPath(selectedProject) : `/proyectos/${projectId}`,
        );
      }
      return;
    }

    if (item?.id === "more-projects") {
      navigate("/dashboard-clientes");
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
    const targetProjectId = comment?.projectId || commentsProjectId;

    if (targetProjectId) {
      const targetProject = ownedProjectRows.find(
        (project) => project.id === Number(targetProjectId),
      );

      navigate(
        targetProject
          ? getProjectPath(targetProject, params.toString())
          : `/proyectos/${targetProjectId}?${params.toString()}`,
      );
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex min-h-screen w-full items-stretch">
        <SideNavigation
          activeItemId="dashboard"
          expanded={isSidebarExpanded}
          items={navigationItems}
          userName={currentUser.name}
          userEmail={currentUser.email}
          userAvatarSrc={currentUser.profilePhotoUrl}
          onExpandedChange={setIsSidebarExpanded}
          onItemSelect={handleSideNavigationSelect}
          onNewOpportunityClick={() => setIsProjectRequestModalOpen(true)}
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

          <div className="mx-auto flex w-full max-w-[1200px] items-start gap-[4px] px-[48px] pb-[16px]">
            <div
              ref={projectsContainerRef}
              className="flex-1 overflow-y-auto pr-[2px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ maxHeight: "232px" }}
              onScroll={(event) => {
                const { scrollTop, scrollHeight, clientHeight } =
                  event.currentTarget;
                const maxScroll = Math.max(scrollHeight - clientHeight, 1);
                setScrollPosition(scrollTop / maxScroll);
              }}
            >
              {projectsLoading ? (
                <p className="text-body-3 py-[24px] text-[var(--color-text-200)]">
                  Cargando proyectos...
                </p>
              ) : projectsError ? (
                <p className="text-body-3 py-[24px] text-[var(--color-danger-100)]">
                  {projectsError}
                </p>
              ) : ownedProjectRows.length ? (
                ownedProjectRows.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))
              ) : (
                <p className="text-body-3 py-[24px] text-[var(--color-text-200)]">
                  No tienes proyectos asignados.
                </p>
              )}
            </div>

            <ScrollBar
              height={232}
              length={scrollLength}
              position={scrollPosition}
              interactive
              onPositionChange={setScrollPosition}
              className="shrink-0"
            />
          </div>

          {publicProjectRows.length ? (
            <div className="mx-auto flex w-full max-w-[1200px] px-[48px] pb-[24px]">
              <ProjectsShowcaseCarousel
                title="Proyectos publicos"
                items={publicProjectRows}
              />
            </div>
          ) : null}

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
            comments={notificationComments}
            commentsError={drawerCommentsError}
            commentsLoading={drawerCommentsLoading}
            recentActivity={CLIENT_DRAWER_RECENT_ACTIVITY}
            onActivitySelect={handleActivitySelect}
            onCommentSelect={openImageComment}
            onSubmitComment={submitComment}
          />
          <ProjectRequestModal
            open={isProjectRequestModalOpen}
            onClose={() => setIsProjectRequestModalOpen(false)}
            onPrevious={() => setIsProjectRequestModalOpen(false)}
            onNext={() => setIsProjectRequestModalOpen(false)}
          />
        </div>
      </div>
    </main>
  );
}

export default Home;
