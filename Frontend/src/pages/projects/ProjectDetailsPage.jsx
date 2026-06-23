import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

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
const PROJECT_TYPE_LABELS = {
  commercial: "Comercial",
  corporate: "Corporativo",
  residential: "Residencial",
  stands_exhibitions: "Stands y exhibiciones",
};

function createProjectStages(progressValue) {
  const stages = [
    { id: "survey", threshold: 25, title: "Levantamiento" },
    { id: "design", threshold: 50, title: "Propuesta de Diseño" },
    { id: "execution", threshold: 75, title: "Ejecución" },
    { id: "handoff", threshold: 100, title: "Entrega Final" },
  ];
  const activeStageIndex = stages.findIndex(
    (stage) => progressValue < stage.threshold,
  );

  return stages.map((stage, index) => {
    if (progressValue >= stage.threshold) {
      return { ...stage, status: "Completado", tone: "completed" };
    }

    if (index === activeStageIndex) {
      return { ...stage, status: "En proceso", tone: "active" };
    }

    return { ...stage, status: "Pendiente", tone: "pending" };
  });
}

function formatFileSize(size) {
  if (!Number.isFinite(Number(size))) {
    return "";
  }

  const bytes = Number(size);

  if (bytes < 1024 * 1024) {
    return `${Math.max(Math.round(bytes / 1024), 1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function upsertCommentById(comments, comment) {
  if (!comment?.id) {
    return comments;
  }

  const exists = comments.some((current) => current.id === comment.id);

  return exists
    ? comments.map((current) => (current.id === comment.id ? comment : current))
    : [...comments, comment];
}

function isImageFile(file) {
  const fileType = String(file?.fileType || "").toLowerCase();
  const extension = String(file?.extension || "").toLowerCase();

  return fileType.startsWith("image/") || ["jpeg", "jpg", "png", "webp"].includes(extension);
}

function isVideoFile(file) {
  const fileType = String(file?.fileType || "").toLowerCase();
  const extension = String(file?.extension || "").toLowerCase();

  return fileType.startsWith("video/") || ["mp4", "webm", "mov"].includes(extension);
}

function isModelFile(file) {
  const fileType = String(file?.fileType || "").toLowerCase();
  const extension = String(file?.extension || "").toLowerCase();

  return (
    fileType === "model/gltf-binary" ||
    fileType === "model/gltf+json" ||
    ["glb", "gltf"].includes(extension)
  );
}

function formatFileDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toMediaFileItem(file, { fallbackImage, project }) {
  const title = file.title || file.name || "Archivo";
  const uploadedAt = formatFileDate(file.createdAt);
  const contentUrl =
    project?.id && file.id
      ? api.projects.getFileContentUrl({
          accessToken: project.fileAccessToken,
          fileId: file.id,
          projectId: project.id,
        })
      : file.fileUrl;

  return {
    author: project.assignedArchitect?.name || project.client?.name || "ARCA Studio",
    extension: file.extension,
    fileType: file.fileType,
    fileUrl: file.fileUrl,
    fileId: file.id,
    id: `project-file-${file.id}`,
    image: isImageFile(file) ? contentUrl : fallbackImage || null,
    label: title,
    modelUrl: isModelFile(file) ? contentUrl : null,
    size: formatFileSize(file.size),
    title,
    uploadedAt,
    video: isVideoFile(file) ? contentUrl : null,
  };
}

function toProjectPresentation(project) {
  const progressValue = Number(project?.progress) || 0;
  const projectFiles = project?.files || [];
  const imageFiles = projectFiles.filter(isImageFile);
  const firstImageUrl = imageFiles.find((file) => file.fileUrl)?.fileUrl || null;
  const renderGallery = imageFiles
    .filter((file) => file.fileUrl)
    .map((file) => toMediaFileItem(file, { project }));
  const videoGallery = projectFiles
    .filter((file) => isVideoFile(file) && file.fileUrl)
    .map((file) => toMediaFileItem(file, { fallbackImage: firstImageUrl, project }));
  const modelGallery = projectFiles
    .filter((file) => isModelFile(file) && file.fileUrl)
    .map((file) => toMediaFileItem(file, { fallbackImage: firstImageUrl, project }));
  const documents = projectFiles
    .filter((file) => !isImageFile(file) && !isVideoFile(file) && !isModelFile(file))
    .map((file) => {
      const contentUrl =
        project?.id && file.id
          ? api.projects.getFileContentUrl({
              accessToken: project.fileAccessToken,
              fileId: file.id,
              projectId: project.id,
            })
          : file.fileUrl;

      return {
        fileType: String(file.extension || "FILE").toUpperCase(),
        fileUrl: contentUrl,
        id: file.id,
        name: file.title,
        owner:
          project.assignedArchitect?.name ||
          project.client?.name ||
          "ARCA Studio",
        size: formatFileSize(file.size),
        uploadedAt: formatFileDate(file.createdAt),
      };
    });

  return {
    ...project,
    category: `Proyecto ${
      PROJECT_TYPE_LABELS[project?.projectType] || project?.projectType || ""
    }`.trim(),
    progressValue,
    stages: createProjectStages(progressValue),
    title: project?.name || "Proyecto",
    documents,
    modelGallery,
    renderGallery,
    videoGallery,
  };
}

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
  project: providedProject = null,
  initialActiveProjectTabIndex = 0,
  infoProps,
  trackingProps,
  warrantiesProps,
}) {
  const navigate = useNavigate();
  const { projectId: routeProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const { logout, user } = useAuth();
  const currentUser = getUserDisplay(user);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [isProjectRequestModalOpen, setIsProjectRequestModalOpen] =
    useState(false);
  const parsedRouteProjectId = Number(routeProjectId);
  const initialProjectId = Number.isInteger(Number(providedProject?.id))
    ? Number(providedProject.id)
    : Number.isInteger(parsedRouteProjectId)
      ? parsedRouteProjectId
      : null;
  const [project, setProject] = useState(providedProject);
  const [projectError, setProjectError] = useState("");
  const [projectLoading, setProjectLoading] = useState(!providedProject);
  const [resolvedProjectId, setResolvedProjectId] = useState(initialProjectId);
  const [projectComments, setProjectComments] = useState([]);
  const [projectCommentsError, setProjectCommentsError] = useState("");
  const [projectCommentsLoading, setProjectCommentsLoading] = useState(false);
  const [activeProjectTabIndex, setActiveProjectTabIndex] = useState(
    searchParams.get("tab") === "renders" ? 1 : initialActiveProjectTabIndex,
  );
  const imageCommentNotifications = useImageCommentNotifications({
    projectIds: resolvedProjectId ? [resolvedProjectId] : [],
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
    if (providedProject || !initialProjectId) {
      if (!providedProject && !initialProjectId) {
        setProjectError("El identificador del proyecto no es válido.");
        setProjectLoading(false);
      }
      return undefined;
    }

    let isMounted = true;
    setProjectLoading(true);
    setProjectError("");

    api.projects
      .getById({ projectId: initialProjectId })
      .then((data) => {
        if (isMounted) {
          setProject(data.project || null);
          setResolvedProjectId(data.project?.id || initialProjectId);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setProject(null);
          setProjectError(
            error.message || "No se pudo cargar la información del proyecto.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setProjectLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialProjectId, providedProject]);

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

    const unsubscribe = api.projects.subscribeToEvents({
      projectId: resolvedProjectId,
      onCommentCreated: (comment) => {
        if (isMounted) {
          setProjectComments((current) => upsertCommentById(current, comment));
        }
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isNotificationsDrawerOpen, resolvedProjectId]);

  const handleSideNavigationSelect = (item) => {
    if (item?.id === "dashboard") {
      navigate("/dashboard-clientes");
      return;
    }

    if (item?.id?.startsWith("project-")) {
      const selectedProjectId = Number(item.id.replace("project-", ""));

      if (Number.isInteger(selectedProjectId)) {
        navigate(`/proyectos/${selectedProjectId}`);
      }
      return;
    }

    if (item?.id === "more-projects") {
      navigate(
        user?.role === "client"
          ? "/dashboard-clientes"
          : "/dashboard-arquitecto",
      );
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
    navigate(`/proyectos/${resolvedProjectId}?${params.toString()}`);
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
        setProjectComments((current) => upsertCommentById(current, data.comment));
      }
    } catch (error) {
      setProjectCommentsError(
        error.message || "No se pudo guardar el comentario.",
      );
    } finally {
      setProjectCommentsLoading(false);
    }
  };

  const presentedProject = project
    ? toProjectPresentation(project)
    : PROJECT_DETAIL_DATA;
  let activeProjectPanel = (
    <ProjectInfoPanel {...infoProps} project={project} />
  );

  if (activeProjectTabIndex === 1) {
    activeProjectPanel = (
      <ProjectRendersPanel
        focusedCommentId={searchParams.get("commentId")}
        focusedImageId={searchParams.get("imageId")}
        modelGallery={presentedProject.modelGallery}
        projectId={resolvedProjectId}
        renderGallery={presentedProject.renderGallery}
        videoGallery={presentedProject.videoGallery}
      />
    );
  } else if (activeProjectTabIndex === 2) {
    activeProjectPanel = (
      <ProjectDocumentsPanel documents={presentedProject.documents} />
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
          activeItemId={
            resolvedProjectId ? `project-${resolvedProjectId}` : undefined
          }
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
            {projectLoading ? (
              <p className="py-[48px] text-body-3 text-[var(--color-text-200)]">
                Cargando proyecto...
              </p>
            ) : projectError ? (
              <p className="py-[48px] text-body-3 text-[var(--color-danger-100)]">
                {projectError}
              </p>
            ) : (
              <>
                <ProjectOverviewHeader project={presentedProject} />
                <ProjectDetailTabMenu
                  activeIndex={activeProjectTabIndex}
                  onChange={setActiveProjectTabIndex}
                />
                {activeProjectPanel}
              </>
            )}
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
