import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../api/http.js";
import { loadAdminDashboardOverview } from "../../api/adminDashboardOverview.js";
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
import { getCommentNavigationParams } from "../../utils/commentSelection.js";
import { getProjectImageSource } from "../../utils/projectImage.js";
import { getProjectAssigneeAvatar } from "../../utils/projectAssigneeDisplay.js";
import { groupProjectsByStatus } from "../../utils/projectStatusGroups.js";
import { createUserSideNavigationItems } from "../../utils/sideNavigationItems.js";
import { isProjectOperationallyReadOnly } from "../../utils/projectReadOnly.js";
import { ARCHITECT_DRAWER_RECENT_ACTIVITY } from "./architectDashboardData.js";
import AdminDashboardHeader from "./components/AdminDashboardHeader.jsx";
import AdminDashboardMetrics from "./components/AdminDashboardMetrics.jsx";
import AdminDashboardOperations from "./components/AdminDashboardOperations.jsx";
import AdminDashboardOverview from "./components/AdminDashboardOverview.jsx";
import AdminActiveProjects from "./components/AdminActiveProjects.jsx";
import ArchitectProjectGroup from "./components/ArchitectProjectGroup.jsx";

const WEB_BREAKPOINT_PX = 1280;

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
  const isAssignedEmployee = (project.assignees || project.assignedArchitects || []).some(
    (assignee) => Number(assignee.id) === Number(user?.id),
  );

  return {
    ...project,
    assigneeAvatars: assigneeAvatar ? [assigneeAvatar] : [],
    editable:
      !isProjectOperationallyReadOnly(project) && (
        user?.role === "admin" ||
        project.assignedArchitect?.id === user?.id ||
        isAssignedEmployee
      ),
    image: getProjectImageSource(project),
    title: project.name,
  };
}

function ArchitectDashboard({ empty = false }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentUser = getUserDisplay(user);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= WEB_BREAKPOINT_PX,
  );
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsError, setProjectsError] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(!empty);
  const [projectsRequestKey, setProjectsRequestKey] = useState(0);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminMetricsError, setAdminMetricsError] = useState("");
  const [adminMetricsLoading, setAdminMetricsLoading] = useState(
    currentUser.roleCode === "admin" && !empty,
  );
  const [adminMetricsRequestKey, setAdminMetricsRequestKey] = useState(0);
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminOverviewError, setAdminOverviewError] = useState("");
  const [adminOverviewLoading, setAdminOverviewLoading] = useState(
    currentUser.roleCode === "admin" && !empty,
  );
  const [adminOverviewRequestKey, setAdminOverviewRequestKey] = useState(0);
  const [adminAssignees, setAdminAssignees] = useState([]);
  const [adminAssigneesLoading, setAdminAssigneesLoading] = useState(
    currentUser.roleCode === "admin" && !empty,
  );
  const canManagePublication =
    user?.permissionCodes?.includes("projects.publish");

  const projectRows = useMemo(
    () => projects.map((project) => toProjectRow(project, user)),
    [projects, user],
  );
  const commentProjectRows = useMemo(
    () =>
      currentUser.roleCode === "admin"
        ? []
        : projectRows.filter((project) => project.editable),
    [currentUser.roleCode, projectRows],
  );
  const projectGroups = useMemo(
    () => groupProjectsByStatus(projectRows),
    [projectRows],
  );
  const upcomingDeliveries = useMemo(
    () =>
      [...projectRows]
        .filter(
          (project) =>
            !["archived", "completed", "cancelled"].includes(project.status),
        )
        .sort((first, second) => {
          const firstDate = first.endDate
            ? new Date(first.endDate).getTime()
            : Number.POSITIVE_INFINITY;
          const secondDate = second.endDate
            ? new Date(second.endDate).getTime()
            : Number.POSITIVE_INFINITY;

          return firstDate - secondDate;
        })
        .slice(0, 3),
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

    if (empty) {
      return () => {
        isMounted = false;
      };
    }

    queueMicrotask(() => {
      if (isMounted) {
        setProjectsLoading(true);
        setProjectsError("");
      }
    });

    if (!user) {
      queueMicrotask(() => {
        if (isMounted) setProjectsLoading(false);
      });
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
  }, [empty, projectsRequestKey, user]);

  useEffect(() => {
    if (currentUser.roleCode !== "admin" || empty) {
      return undefined;
    }

    const abortController = new AbortController();
    Promise.resolve()
      .then(() => {
        if (abortController.signal.aborted) {
          return null;
        }

        setAdminMetricsLoading(true);
        setAdminMetricsError("");
        return api.admin.getDashboardMetrics({
          signal: abortController.signal,
        });
      })
      .then((data) => {
        if (data) {
          setAdminMetrics(data.metrics || null);
        }
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setAdminMetricsError(
            error?.message || "No se pudieron cargar las métricas.",
          );
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setAdminMetricsLoading(false);
        }
      });

    return () => abortController.abort();
  }, [adminMetricsRequestKey, currentUser.roleCode, empty]);

  useEffect(() => {
    if (currentUser.roleCode !== "admin" || empty) {
      return undefined;
    }

    const abortController = new AbortController();

    Promise.resolve()
      .then(() => {
        if (abortController.signal.aborted) {
          return null;
        }

        setAdminOverviewLoading(true);
        setAdminOverviewError("");
        return loadAdminDashboardOverview({
          force: adminOverviewRequestKey > 0,
          scopeKey: user?.id || user?.email,
        });
      })
      .then((overview) => {
        if (overview && !abortController.signal.aborted) {
          setAdminOverview(overview);
        }
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setAdminOverviewError(
            error?.message || "No se pudo cargar la actividad administrativa.",
          );
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setAdminOverviewLoading(false);
        }
      });

    return () => abortController.abort();
  }, [adminOverviewRequestKey, currentUser.roleCode, empty, user]);

  useEffect(() => {
    if (currentUser.roleCode !== "admin" || empty) {
      return undefined;
    }

    const abortController = new AbortController();
    Promise.resolve()
      .then(() => {
        if (abortController.signal.aborted) return null;
        setAdminAssigneesLoading(true);
        return api.admin.listAssignees({ signal: abortController.signal });
      })
      .then((data) => {
        if (data && !abortController.signal.aborted) {
          setAdminAssignees(data.assignees || []);
        }
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setAdminAssignees([]);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setAdminAssigneesLoading(false);
        }
      });

    return () => abortController.abort();
  }, [currentUser.roleCode, empty]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${WEB_BREAKPOINT_PX - 1}px)`,
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
    const targetProject = activity?.projectId
      ? projectRows.find(
          (project) => Number(project.id) === Number(activity.projectId),
        )
      : null;
    const targetPath = activity?.to ||
      (targetProject ? getProjectPath(targetProject) : null);

    if (!targetPath) return;

    setIsNotificationsDrawerOpen(false);
    navigate(targetPath);
  };

  const handleNotificationsToggle = () => {
    const willOpen = !isNotificationsDrawerOpen;

    setIsNotificationsDrawerOpen(willOpen);

    if (willOpen && currentUser.roleCode === "admin") {
      setAdminOverviewRequestKey((current) => current + 1);
    }
  };

  const openImageComment = (comment) => {
    const params = getCommentNavigationParams(comment);

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
    if (project.status === "archived") return;
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

  const handleProjectAssigneesChange = async (project, assignees) => {
    const data = await api.admin.updateProjectAssignees({
      assigneeIds: assignees.map((assignee) => Number(assignee.id)),
      projectId: project.id,
    });

    setProjects((currentProjects) =>
      currentProjects.map((currentProject) =>
        currentProject.id === project.id
          ? {
              ...currentProject,
              assignees: data.assignees || [],
              assignedArchitect: data.assignees?.[0] || null,
              assignedArchitects: data.assignees || [],
            }
          : currentProject,
      ),
    );
  };

  const handleProjectBulkAction = async ({ action, projects: selectedProjects }) => {
    const isPublic = action === "change_visibility"
      ? !selectedProjects.every((project) => project.isPublic)
      : undefined;
    const data = await api.admin.updateProjects({
      action,
      isPublic,
      projectIds: selectedProjects.map((project) => Number(project.id)),
    });
    const updatedProjects = new Map(
      (data.projects || []).map((project) => [Number(project.id), project]),
    );

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        const updatedProject = updatedProjects.get(Number(project.id));
        return updatedProject ? { ...project, ...updatedProject } : project;
      }),
    );
    setAdminMetricsRequestKey((current) => current + 1);
    setAdminOverviewRequestKey((current) => current + 1);

    return data;
  };

  const handleRequestAssigneesChange = async (request, assignees) => {
    const data = await api.admin.updateProjectRequestAssignees({
      assigneeIds: assignees.map((assignee) => Number(assignee.id)),
      projectRequestId: request.id,
    });

    setAdminOverview((currentOverview) => ({
      ...currentOverview,
      newRequests: (currentOverview?.newRequests || []).map((currentRequest) =>
        currentRequest.id === request.id
          ? { ...currentRequest, assignees: data.assignees || [] }
          : currentRequest,
      ),
    }));
  };

  return (
    <main className="h-screen overflow-hidden bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex h-full min-h-0 w-full items-stretch">
        <SideNavigation
          activeItemId="dashboard"
          expanded={isSidebarExpanded}
          items={navigationItems}
          newOpportunityLabel="Nuevo proyecto"
          userName={currentUser.name}
          userEmail={currentUser.email}
          userAvatarSrc={currentUser.profilePhotoUrl}
          onExpandedChange={(nextExpanded) => {
            if (window.innerWidth >= WEB_BREAKPOINT_PX) {
              setIsSidebarExpanded(nextExpanded);
            }
          }}
          onItemSelect={handleSideNavigationSelect}
          onNewOpportunityClick={() =>
            navigate("/dashboard-arquitecto/nuevo-proyecto")
          }
          onLogoutClick={() => {
            logout();
            navigate("/");
          }}
          className="h-screen shrink-0 self-stretch"
        />

        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col self-stretch overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-out">
          <NavigationBar
            utilityActionActive={isNotificationsDrawerOpen}
            onUtilityActionClick={handleNotificationsToggle}
          />

          <div className="mx-auto flex w-full max-w-[1200px] px-[16px] pb-[16px] sm:px-[24px] lg:px-[48px]">
            <p className="text-heading-6 w-full text-[var(--color-text-300)]">
              Bienvenido, {currentUser.shortName}
            </p>
          </div>

          {currentUser.roleCode === "admin" ? (
            <>
              <AdminDashboardHeader />
              <AdminDashboardMetrics
                error={adminMetricsError}
                loading={adminMetricsLoading}
                metrics={adminMetrics}
                onRetry={() =>
                  setAdminMetricsRequestKey((current) => current + 1)
                }
              />
              <AdminDashboardOperations
                deliveries={upcomingDeliveries}
                deliveriesError={projectsError}
                deliveriesLoading={projectsLoading}
                events={empty ? [] : undefined}
                onProjectSelect={(project) => navigate(getProjectPath(project))}
                onViewProjects={() => navigate("/proyectos")}
              />
              <AdminDashboardOverview
                assignees={adminAssignees}
                assigneesLoading={adminAssigneesLoading}
                error={adminOverviewError}
                loading={adminOverviewLoading}
                newRequests={adminOverview?.newRequests}
                recentActivity={(adminOverview?.recentActivity || []).slice(0, 3)}
                onActivitySelect={(activity) => {
                  const project = projectRows.find(
                    (currentProject) =>
                      currentProject.id === Number(activity.projectId),
                  );

                  if (project) {
                    navigate(getProjectPath(project));
                  }
                }}
                onRequestAssigneesChange={handleRequestAssigneesChange}
                onRetry={() =>
                  setAdminOverviewRequestKey((current) => current + 1)
                }
              />
              <AdminActiveProjects
                assignees={adminAssignees}
                assigneesLoading={adminAssigneesLoading}
                error={projectsError}
                loading={projectsLoading}
                projects={projectRows}
                onBulkAction={handleProjectBulkAction}
                onOpenProject={(project) => navigate(getProjectPath(project))}
                onProjectAssigneesChange={handleProjectAssigneesChange}
                onRetry={() => setProjectsRequestKey((current) => current + 1)}
              />
            </>
          ) : null}

          {currentUser.roleCode !== "admin" && projectsLoading ? (
            <div className="mx-auto flex min-h-[360px] w-full max-w-[1200px] px-[16px] pb-[48px] sm:px-[24px] lg:px-[48px]">
              <Loader
                preset="projectRow"
                count={3}
                label="Cargando proyectos"
              />
            </div>
          ) : currentUser.roleCode !== "admin" && projectsError ? (
            <div className="mx-auto flex w-full max-w-[1200px] px-[16px] pb-[48px] sm:px-[24px] lg:px-[48px]">
              <p className="text-body-3 text-[var(--color-danger-100)]">
                {projectsError}
              </p>
            </div>
          ) : currentUser.roleCode !== "admin" && (empty || !projectRows.length) ? (
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-center px-[16px] pb-[48px] sm:px-[24px] lg:px-[48px]">
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
          ) : currentUser.roleCode !== "admin" ? (
            <div className="content-reveal mx-auto flex w-full max-w-[1200px] flex-col gap-[48px] px-[16px] pb-[48px] sm:px-[24px] lg:px-[48px]">
              {projectGroups.map((group) => (
                <ArchitectProjectGroup
                  key={group.id}
                  canManagePublication={canManagePublication}
                  group={group}
                  onPublicationChange={handlePublicationChange}
                />
              ))}
            </div>
          ) : null}

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
            comments={notificationComments}
            commentsError={drawerCommentsError}
            commentsLoading={drawerCommentsLoading}
            recentActivity={ARCHITECT_DRAWER_RECENT_ACTIVITY}
            onActivitySelect={handleActivitySelect}
            onCommentSelect={openImageComment}
            onSubmitComment={commentsProjectId ? submitComment : undefined}
          />
        </div>
      </div>
    </main>
  );
}

export default ArchitectDashboard;
