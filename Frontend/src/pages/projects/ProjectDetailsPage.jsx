import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../../api/http.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getUserDisplay } from "../../auth/userDisplay.js";
import NavigationBar from "../../components/ui/NavigationBar/NavigationBar.jsx";
import { useImageCommentNotifications } from "../../components/ui/Gallery/useImageComments.js";
import NotificationsDrawer from "../../components/ui/NotificationsDrawer.jsx";
import ProjectRequestModal from "../../components/ui/ProjectRequestModal.jsx";
import SideNavigation from "../../components/ui/SideNavigation/SideNavigation.jsx";
import { CLIENT_DRAWER_RECENT_ACTIVITY } from "../clientDrawerData.js";
import ProjectDetailTabMenu from "./components/ProjectDetailTabMenu.jsx";
import ProjectOverviewHeader from "./components/ProjectOverviewHeader.jsx";
import ProjectDocumentsPanel from "./panels/ProjectDocumentsPanel.jsx";
import ProjectInfoPanel from "./panels/ProjectInfoPanel.jsx";
import ProjectRendersPanel from "./panels/ProjectRendersPanel.jsx";
import ProjectTrackingPanel from "./panels/ProjectTrackingPanel.jsx";
import ProjectUploadFilesPanel from "./panels/ProjectUploadFilesPanel.jsx";
import ProjectWarrantiesPanel from "./panels/ProjectWarrantiesPanel.jsx";
import { PROJECT_DETAIL_DATA } from "./projectDetailsData.js";

const TABLET_BREAKPOINT_PX = 768;

function getRelativeTimeLabel(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) {
    return "Ahora";
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `Hace ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
}

function getCommentAuthorLabel(comment, user) {
  const author = comment.author;

  const authorId = author?.id == null ? "" : String(author.id);
  const authorEmail = String(author?.email || "")
    .trim()
    .toLowerCase();
  const authorName = String(
    author?.name ||
      [author?.firstName, author?.lastName].filter(Boolean).join(" "),
  )
    .trim()
    .toLowerCase();
  const userId = user?.id == null ? "" : String(user.id);
  const userEmail = String(user?.email || "")
    .trim()
    .toLowerCase();
  const userName = String(
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
  )
    .trim()
    .toLowerCase();

  const isCurrentUser =
    (authorId && userId && authorId === userId) ||
    (authorEmail && userEmail && authorEmail === userEmail) ||
    (authorName && userName && authorName === userName);

  if (isCurrentUser) {
    return "Tú";
  }

  const name = author?.name || comment.name || "Usuario";

  return author?.roleCode === "architect" ? `Arq. ${name}` : name;
}

function toDrawerComment(comment, user) {
  return {
    id: comment.id,
    message: comment.content,
    name: getCommentAuthorLabel(comment, user),
    createdAt: comment.createdAt,
    parentCommentId: comment.parentCommentId,
    projectId: comment.projectId,
    timestamp: getRelativeTimeLabel(comment.createdAt),
    type: comment.type,
  };
}

export default function ProjectDetailsPage({
  project = PROJECT_DETAIL_DATA,
  initialActiveProjectTabIndex = 0,
  infoProps,
  trackingProps,
  warrantiesProps,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, user } = useAuth();
  const currentUser = getUserDisplay(user);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [isProjectRequestModalOpen, setIsProjectRequestModalOpen] =
    useState(false);
  const [resolvedProjectId, setResolvedProjectId] = useState(
    Number.isInteger(Number(project.id)) ? Number(project.id) : null,
  );
  const [projectComments, setProjectComments] = useState([]);
  const [projectCommentsError, setProjectCommentsError] = useState("");
  const [projectCommentsLoading, setProjectCommentsLoading] = useState(false);
  const [activeProjectTabIndex, setActiveProjectTabIndex] = useState(
    searchParams.get("tab") === "renders" ? 1 : initialActiveProjectTabIndex,
  );
  const imageCommentNotifications = useImageCommentNotifications({
    projectIds: resolvedProjectId
      ? [resolvedProjectId, project.id]
      : [project.id],
  });
  const notificationComments = [
    ...projectComments
      .filter((comment) => (comment.commentType || "general") === "general")
      .map((comment) => toDrawerComment(comment, user)),
    ...imageCommentNotifications,
  ];

  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const formattedTodayLabel =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

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

  useEffect(() => {
    if (searchParams.get("tab") === "renders") {
      setActiveProjectTabIndex(1);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resolvedProjectId) {
      return undefined;
    }

    let isMounted = true;

    api.projects
      .list()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const projects = Array.isArray(data.projects) ? data.projects : [];
        const matchingProject =
          projects.find((item) => item.name === project.title) || projects[0];

        setResolvedProjectId(matchingProject?.id ?? null);
      })
      .catch(() => {
        if (isMounted) {
          setResolvedProjectId(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [project.title, resolvedProjectId]);

  useEffect(() => {
    if (!isNotificationsDrawerOpen || !resolvedProjectId) {
      return undefined;
    }

    let isMounted = true;

    function loadProjectComments({ showLoading = false } = {}) {
      if (showLoading) {
        setProjectCommentsLoading(true);
      }

      setProjectCommentsError("");

      api.projects
        .listComments({ projectId: resolvedProjectId })
        .then((data) => {
          if (isMounted) {
            setProjectComments(
              Array.isArray(data.comments) ? data.comments : [],
            );
          }
        })
        .catch((error) => {
          if (isMounted) {
            setProjectCommentsError(
              error.message || "No se pudieron cargar los comentarios.",
            );
          }
        })
        .finally(() => {
          if (isMounted && showLoading) {
            setProjectCommentsLoading(false);
          }
        });
    }

    loadProjectComments({ showLoading: true });

    const refreshInterval = window.setInterval(loadProjectComments, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, [isNotificationsDrawerOpen, resolvedProjectId]);

  const handleSideNavigationSelect = (item) => {
    if (item?.id === "dashboard") {
      navigate("/dashboard-clientes");
      return;
    }

    if (item?.id === "project-1" || item?.id === "project-2") {
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

  const handleSubmitComment = async ({ message, parentCommentId = null }) => {
    if (!resolvedProjectId) {
      setProjectCommentsError("No se encontro el proyecto para comentar.");
      return;
    }

    setProjectCommentsLoading(true);
    setProjectCommentsError("");

    try {
      const data = await api.projects.createComment({
        content: message,
        parentCommentId,
        projectId: resolvedProjectId,
      });

      if (data.comment) {
        setProjectComments((current) => [...current, data.comment]);
      }
    } catch (error) {
      setProjectCommentsError(
        error.message || "No se pudo guardar el comentario.",
      );
    } finally {
      setProjectCommentsLoading(false);
    }
  };

  let activeProjectPanel = <ProjectInfoPanel {...infoProps} />;

  if (activeProjectTabIndex === 1) {
    activeProjectPanel = (
      <ProjectRendersPanel
        focusedCommentId={searchParams.get("commentId")}
        focusedImageId={searchParams.get("imageId")}
        projectId={resolvedProjectId}
      />
    );
  } else if (activeProjectTabIndex === 2) {
    activeProjectPanel = (
      <ProjectDocumentsPanel documents={project.documents} />
    );
  } else if (activeProjectTabIndex === 3) {
    activeProjectPanel = <ProjectTrackingPanel {...trackingProps} />;
  } else if (activeProjectTabIndex === 4) {
    activeProjectPanel = <ProjectWarrantiesPanel {...warrantiesProps} />;
  } else if (activeProjectTabIndex === 5) {
    activeProjectPanel = <ProjectUploadFilesPanel />;
  }

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex min-h-screen w-full items-stretch">
        <SideNavigation
          activeItemId="project-1"
          expanded={isSidebarExpanded}
          userName={currentUser.name}
          userEmail={currentUser.email}
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

          <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-[48px] px-[48px] pb-[24px] pt-0">
            <ProjectOverviewHeader project={project} />
            <ProjectDetailTabMenu
              activeIndex={activeProjectTabIndex}
              onChange={setActiveProjectTabIndex}
            />
            {activeProjectPanel}
          </div>

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
            comments={notificationComments}
            commentsError={projectCommentsError}
            commentsLoading={projectCommentsLoading}
            recentActivity={CLIENT_DRAWER_RECENT_ACTIVITY}
            onActivitySelect={handleActivitySelect}
            onCommentSelect={openImageComment}
            onSubmitComment={handleSubmitComment}
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
