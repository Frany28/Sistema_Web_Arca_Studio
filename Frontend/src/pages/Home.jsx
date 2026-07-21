import NavigationBar from "../components/ui/NavigationBar/NavigationBar.jsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, getAuthToken } from "../api/http.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { getUserDisplay } from "../auth/userDisplay.js";
import AvatarGroup from "../components/ui/AvatarGroup/AvatarGroup.jsx";
import Badge from "../components/ui/Badge/Badge.jsx";
import AuthToast, { AuthToastLockIcon } from "../components/ui/AuthToast/AuthToast.jsx";
import Button from "../components/ui/Button/Button.jsx";
import Loader from "../components/ui/Loader/Loader.jsx";
import NotificationsDrawer from "../components/ui/NotificationsDrawer.jsx";
import ProjectRequestModal from "../components/ui/ProjectRequestModal.jsx";
import ProjectProgress from "../components/ui/ProjectProgress/ProjectProgress.jsx";
import ProjectImage from "../components/ui/ProjectImage/ProjectImage.jsx";
import ProjectsShowcaseCarousel from "../components/ui/ProjectsShowcaseCarousel.jsx";
import ScrollBar from "../components/ui/ScrollBar/ScrollBar.jsx";
import SideNavigation from "../components/ui/SideNavigation/SideNavigation.jsx";
import Tooltip from "../components/ui/Tooltip/Tooltip.jsx";
import { useImageCommentNotifications } from "../components/ui/Gallery/useImageComments.js";
import {
  useProjectComments,
  useRecentProjectComments,
} from "../hooks/useProjectComments.js";
import { getProjectNamesById } from "../utils/commentDisplay.js";
import { getProjectPath } from "../utils/projectRoutes.js";
import { getProjectAssigneeAvatar } from "../utils/projectAssigneeDisplay.js";
import { groupProjectsByStatus } from "../utils/projectStatusGroups.js";
import { CLIENT_DRAWER_RECENT_ACTIVITY } from "./clientDrawerData.js";

const EXPANDED_SIDEBAR_WIDTH = 312;
const COLLAPSED_SIDEBAR_WIDTH = 76;
const TABLET_BREAKPOINT_PX = 768;
const PROJECT_REQUEST_EXAMPLES = [
  {
    id: "request-stand-nexar-2026",
    title: "Stand Nexar 2026",
    assigneeAvatars: [
      { content: "Icon", name: "ARCA Studio", theme: "Neutral" },
      { content: "Text", initials: "AC", name: "Arquitecto coordinador", theme: "Neutral" },
    ],
  },
  {
    id: "request-savory-motion",
    title: "Savory Motion",
    assigneeAvatars: [
      { content: "Icon", name: "ARCA Studio", theme: "Neutral" },
      { content: "Text", initials: "AC", name: "Arquitecto coordinador", theme: "Neutral" },
    ],
  },
];

function mergeNotificationComments(comments) {
  const commentsById = new Map();

  comments.forEach((comment) => {
    if (comment?.id) {
      commentsById.set(String(comment.id), comment);
    }
  });

  return Array.from(commentsById.values());
}

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

function toProjectRow(project) {
  return {
    ...project,
    assigneeAvatars: getProjectAssigneeAvatars(project),
    image: project.image,
    title: project.name,
  };
}

function ProjectRow({ project }) {
  const navigate = useNavigate();

  return (
    <article className="flex flex-col gap-[16px] border-b border-[var(--color-neutral-200)] px-0 py-[16px] lg:flex-row lg:items-center lg:gap-[24px]">
      <ProjectImage
        src={project.image}
        alt={project.name}
        className="h-[80px] w-[140px] shrink-0 rounded-[var(--radius-2)]"
        imageClassName="object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="min-w-0 truncate text-heading-4 text-[var(--color-text-50)]">
            {project.name}
          </h2>
          {project.assigneeAvatars.length ? (
            <Tooltip text={project.assigneeAvatars[0].name} tipPosition="Top center">
              <AvatarGroup size="S" items={project.assigneeAvatars} tabIndex={0} />
            </Tooltip>
          ) : null}
        </div>

        <ProjectProgress />
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

function ProjectRequestRow({ request }) {
  return (
    <article className="flex flex-col gap-[16px] border-b border-[var(--color-neutral-200)] py-[16px] lg:flex-row lg:items-center lg:gap-[24px]">
      <ProjectImage
        alt={request.title}
        className="h-[91px] w-[160px] shrink-0 rounded-[var(--radius-2)]"
      />

      <div className="flex min-w-[300px] flex-1 flex-col gap-[8px] max-sm:min-w-0">
        <div className="flex min-w-0 items-center gap-[8px]">
          <h2 className="min-w-0 truncate text-heading-4 text-[var(--color-text-50)]">
            {request.title}
          </h2>
          <Tooltip text="Equipo ARCA Studio" tipPosition="Top center">
            <AvatarGroup
              size="S"
              items={request.assigneeAvatars}
              tabIndex={0}
            />
          </Tooltip>
        </div>

        <ProjectProgress />
      </div>

      <Button
        theme="Primary"
        type="Solid"
        size="M"
        fitContent
        showLeftIcon={false}
        showRightIcon={false}
        disabled
        className="shrink-0"
      >
        Revisar solicitud
      </Button>
    </article>
  );
}

function ProjectStatusGroup({ group }) {
  return (
    <section className="flex flex-col">
      <div className="flex items-center gap-[8px]">
        <p className="text-body-3 text-[var(--color-text-300)]">Proyectos</p>
        <Badge
          label={group.status}
          theme={group.badgeTheme}
          variation="Simple"
          size="S"
        />
      </div>
      <div className="flex flex-col">
        {group.projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

function useSyncedScrollBar(contentKey) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(0);
  const [length, setLength] = useState(1);

  const syncMetrics = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const maxScroll = Math.max(container.scrollHeight - container.clientHeight, 0);
    setLength(
      Math.min(container.clientHeight / Math.max(container.scrollHeight, 1), 1),
    );
    setPosition(maxScroll > 0 ? container.scrollTop / maxScroll : 0);
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(syncMetrics);
    const resizeObserver = new ResizeObserver(syncMetrics);
    resizeObserver.observe(container);
    window.addEventListener("resize", syncMetrics);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncMetrics);
    };
  }, [contentKey, syncMetrics]);

  const changePosition = useCallback((nextPosition) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const maxScroll = Math.max(container.scrollHeight - container.clientHeight, 0);
    container.scrollTo({ top: maxScroll * nextPosition, behavior: "auto" });
    setPosition(nextPosition);
  }, []);

  return {
    containerRef,
    length,
    onScroll: syncMetrics,
    position,
    setPosition: changePosition,
  };
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
  const [projects, setProjects] = useState([]);
  const [projectsError, setProjectsError] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [registrationToast] = useState(() => {
    try {
      if (window.sessionStorage.getItem("arca_registration_complete") === "true") {
        window.sessionStorage.removeItem("arca_registration_complete");
        return Date.now();
      }
    } catch {
      // The dashboard remains usable when session storage is unavailable.
    }
    return null;
  });
  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const formattedTodayLabel =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);
  const projectRows = useMemo(
    () => projects.map((project) => toProjectRow(project)),
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
  const projectGroups = useMemo(
    () => groupProjectsByStatus(ownedProjectRows),
    [ownedProjectRows],
  );
  const {
    containerRef: projectsContainerRef,
    length: projectScrollLength,
    onScroll: handleProjectScroll,
    position: projectScrollPosition,
    setPosition: setProjectScrollPosition,
  } = useSyncedScrollBar(
    projectGroups.map((group) => `${group.id}:${group.projects.length}`).join("|"),
  );
  const {
    containerRef: requestsContainerRef,
    length: requestScrollLength,
    onScroll: handleRequestScroll,
    position: requestScrollPosition,
    setPosition: setRequestScrollPosition,
  } = useSyncedScrollBar(PROJECT_REQUEST_EXAMPLES.length);
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
      <AuthToast
        trigger={registrationToast}
        title="Cuenta creada"
        description="Tu correo fue verificado y tu cuenta está lista."
        leading={<AuthToastLockIcon />}
      />
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

          <div className="mx-auto flex w-full max-w-[1200px] px-[16px] py-[16px] sm:px-[24px] lg:px-[48px]">
            <p className="text-heading-6 w-full text-[var(--color-text-300)]">
              Bienvenido, {currentUser.shortName}
            </p>
          </div>

          <div className="mx-auto flex w-full max-w-[1200px] items-start gap-[4px] px-[16px] pb-[24px] sm:px-[24px] lg:px-[48px]">
            <div
              ref={projectsContainerRef}
              className="flex-1 overflow-y-auto pr-[2px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ maxHeight: "232px" }}
              onScroll={handleProjectScroll}
            >
              {projectsLoading ? (
                <Loader
                  variant="responsive"
                  label="Cargando proyectos"
                  className="py-[24px]"
                />
              ) : projectsError ? (
                <p className="text-body-3 py-[24px] text-[var(--color-danger-100)]">
                  {projectsError}
                </p>
              ) : projectGroups.length ? (
                <div className="flex flex-col gap-[24px]">
                  {projectGroups.map((group) => (
                    <ProjectStatusGroup key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <p className="text-body-3 py-[24px] text-[var(--color-text-200)]">
                  No tienes proyectos asignados.
                </p>
              )}
            </div>

            <ScrollBar
              height={232}
              length={projectScrollLength}
              position={projectScrollPosition}
              interactive
              onPositionChange={setProjectScrollPosition}
              className="shrink-0"
            />
          </div>

          <section className="mx-auto flex w-full max-w-[1200px] flex-col px-[16px] pb-[24px] sm:px-[24px] lg:px-[48px]">
            <div className="flex items-center pb-[4px]">
              <Badge
                label="Solicitudes"
                theme="Brand 1"
                variation="Simple"
                size="S"
              />
            </div>

            <div className="flex w-full items-start gap-[4px]">
              <div
                ref={requestsContainerRef}
                className="min-w-0 flex-1 overflow-y-auto pr-[2px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ maxHeight: "122px" }}
                onScroll={handleRequestScroll}
              >
                {PROJECT_REQUEST_EXAMPLES.map((request) => (
                  <ProjectRequestRow key={request.id} request={request} />
                ))}
              </div>

              <ScrollBar
                height={122}
                length={requestScrollLength}
                position={requestScrollPosition}
                interactive
                onPositionChange={setRequestScrollPosition}
                className="shrink-0"
              />
            </div>
          </section>

          {publicProjectRows.length ? (
            <div className="mx-auto flex w-full max-w-[1200px] px-[16px] pb-[24px] sm:px-[24px] lg:px-[48px]">
              <ProjectsShowcaseCarousel
                title="Ver más proyectos"
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
