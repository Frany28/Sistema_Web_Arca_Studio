import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../api/http.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getUserDisplay } from "../../auth/userDisplay.js";
import NavigationBar from "../../components/EnvironmentNavigationBar.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";
import Loader from "../../components/ui/Loader/Loader.jsx";
import NotificationsDrawer from "../../components/EnvironmentNotificationsDrawer.jsx";
import SideNavigation from "../../components/ui/SideNavigation/SideNavigation.jsx";
import { useImageCommentNotifications } from "../../components/ui/Gallery/useImageComments.js";
import {
  useProjectComments,
  useRecentProjectComments,
} from "../../hooks/useProjectComments.js";
import { getProjectNamesById } from "../../utils/commentDisplay.js";
import { getProjectPath } from "../../utils/projectRoutes.js";
import { getProjectImageSource } from "../../utils/projectImage.js";
import { getProjectAssigneeAvatar } from "../../utils/projectAssigneeDisplay.js";
import { groupProjectsByStatus } from "../../utils/projectStatusGroups.js";
import { createUserSideNavigationItems } from "../../utils/sideNavigationItems.js";
import { ARCHITECT_DRAWER_RECENT_ACTIVITY } from "./architectDashboardData.js";
import ArchitectProjectGroup from "./components/ArchitectProjectGroup.jsx";

const TABLET_BREAKPOINT_PX = 768;

function mergeNotificationComments(comments) {
  const commentsById = new Map();

  comments.forEach((comment) => {
    if (comment?.id) {
      commentsById.set(String(comment.id), comment);
    }
  });

  return Array.from(commentsById.values());
}

function toProjectRow(project, user) {
  const assigneeAvatar = getProjectAssigneeAvatar(project);

  return {
    ...project,
    assigneeAvatars: assigneeAvatar ? [assigneeAvatar] : [],
    editable:
      user?.role === "admin" || project.assignedArchitect?.id === user?.id,
    image: getProjectImageSource(project),
    title: project.name,
  };
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

  const projectRows = useMemo(
    () => projects.map((project) => toProjectRow(project, user)),
    [projects, user],
  );
  const commentProjectRows = useMemo(
    () => projectRows.filter((project) => project.editable),
    [projectRows],
  );
  const projectGroups = useMemo(
    () => groupProjectsByStatus(projectRows),
    [projectRows],
  );
  const navigationItems = useMemo(
    () => createUserSideNavigationItems(projectRows, currentUser.roleCode),
    [currentUser.roleCode, projectRows],
  );
  const imageCommentNotifications = useImageCommentNotifications({
    projectIds: commentProjectRows.map((project) => project.id),
    projectNamesById: getProjectNamesById(commentProjectRows),
    refreshIntervalMs: isNotificationsDrawerOpen ? 5000 : 15000,
  });
  const commentsProjectId = commentProjectRows[0]?.id ?? null;
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
    enabled: commentProjectRows.length > 0,
    projectIds: commentProjectRows.map((project) => project.id),
    projectNamesById: getProjectNamesById(commentProjectRows),
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
  const drawerCommentsError = recentProjectCommentsError;
  const drawerCommentsLoading = recentProjectCommentsLoading;
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
    if (item?.to) {
      navigate(item.to);
      return;
    }

    if (item?.id === "dashboard") {
      navigate("/dashboard-arquitecto");
      return;
    }

    if (item?.id?.startsWith("project-")) {
      const projectId = Number(item.id.replace("project-", ""));

      if (Number.isInteger(projectId)) {
        const selectedProject = projectRows.find(
          (project) => project.id === projectId,
        );

        navigate(
          selectedProject ? getProjectPath(selectedProject) : `/proyectos/${projectId}`,
        );
      }
      return;
    }

    if (item?.id === "more-projects") {
      navigate("/proyectos");
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
    const targetProjectId = comment?.projectId || commentProjectRows[0]?.id;

    if (targetProjectId) {
      const targetProject = projectRows.find(
        (project) => project.id === Number(targetProjectId),
      );

      navigate(
        targetProject
          ? getProjectPath(targetProject, params.toString())
          : `/proyectos/${targetProjectId}?${params.toString()}`,
      );
    }
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
          userAvatarSrc={currentUser.profilePhotoUrl}
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
            utilityActionActive={isNotificationsDrawerOpen}
            onUtilityActionClick={() =>
              setIsNotificationsDrawerOpen((current) => !current)
            }
          />

          <div className="mx-auto flex w-full max-w-[1200px] px-[48px] py-[16px]">
            <p className="text-heading-6 w-full text-[var(--color-text-300)]">
              Bienvenido, {currentUser.shortName}
            </p>
          </div>

          {projectsLoading ? (
            <div className="mx-auto flex min-h-[360px] w-full max-w-[1200px] px-[16px] pb-[48px] sm:px-[24px] lg:px-[48px]">
              <Loader
                preset="projectRow"
                count={3}
                label="Cargando proyectos"
              />
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
            <div className="content-reveal mx-auto flex w-full max-w-[1200px] flex-col gap-[48px] px-[48px] pb-[48px]">
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
