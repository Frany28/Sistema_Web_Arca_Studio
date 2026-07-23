import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { api } from "../../api/http.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getUserDisplay } from "../../auth/userDisplay.js";
import { decorateCommentForDisplay } from "../../utils/commentDisplay.js";
import NavigationBar from "../../components/ui/NavigationBar/NavigationBar.jsx";
import { useImageCommentNotifications } from "../../components/ui/Gallery/useImageComments.js";
import NotificationsDrawer from "../../components/ui/NotificationsDrawer.jsx";
import Loader from "../../components/ui/Loader/Loader.jsx";
import TabPanel from "../../components/ui/TabPanel.jsx";
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
import { getProjectPath } from "../../utils/projectRoutes.js";
import { getProjectTypeDisplay } from "../../utils/projectTypeDisplay.js";

const TABLET_BREAKPOINT_PX = 768;
const PROJECT_DETAIL_LOADER_SECTIONS = [
  "info",
  "renders",
  "documents",
  "tracking",
  "warranties",
  "upload",
];
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

function mergeCommentsById(currentComments, nextComments) {
  const commentsById = new Map();

  currentComments.forEach((comment) => {
    if (comment?.id) {
      commentsById.set(String(comment.id), comment);
    }
  });

  nextComments.forEach((comment) => {
    if (comment?.id) {
      commentsById.set(String(comment.id), comment);
    }
  });

  return Array.from(commentsById.values()).sort(
    (left, right) =>
      new Date(left.createdAt || 0).getTime() -
      new Date(right.createdAt || 0).getTime(),
  );
}

function mergeNotificationComments(comments) {
  const commentsById = new Map();

  comments.forEach((comment) => {
    if (comment?.id) {
      commentsById.set(String(comment.id), comment);
    }
  });

  return Array.from(commentsById.values());
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

function toMediaFileItem(file, { project }) {
  const title = file.title || file.name || "Archivo";
  const uploadedAt = formatFileDate(file.createdAt);
  const contentUrl =
    project?.id && file.id
      ? api.projects.getFileContentUrl({
          fileId: file.id,
          projectId: project.id,
        })
      : null;

  return {
    author:
      file.uploadedBy?.name ||
      project.assignedArchitect?.name ||
      project.client?.name ||
      "ARCA Studio",
    authorAvatarSrc: null,
    extension: file.extension,
    fileType: file.fileType,
    fileUrl: contentUrl,
    fileId: file.id,
    id: `project-file-${file.id}`,
    image: isImageFile(file) ? contentUrl : null,
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
  const renderGallery = imageFiles
    .filter((file) => file.available)
    .map((file) => toMediaFileItem(file, { project }));
  const videoGallery = projectFiles
    .filter((file) => isVideoFile(file) && file.available)
    .map((file) => toMediaFileItem(file, { project }));
  const modelGallery = projectFiles
    .filter((file) => isModelFile(file) && file.available)
    .map((file) => toMediaFileItem(file, { project }));
  const documents = projectFiles
    .filter((file) => !isImageFile(file) && !isVideoFile(file) && !isModelFile(file))
    .map((file) => {
      const contentUrl =
        project?.id && file.id
          ? api.projects.getFileContentUrl({
              fileId: file.id,
              projectId: project.id,
            })
          : null;

      return {
        createdAt: file.createdAt,
        fileType: String(file.extension || "FILE").toUpperCase(),
        fileUrl: contentUrl,
        id: file.id,
        name: file.title,
        owner: file.uploadedBy?.name || "ARCA Studio",
        ownerAvatarSrc: null,
        size: formatFileSize(file.size),
        uploadedAt: formatFileDate(file.createdAt),
      };
    });

  return {
    ...project,
    category: getProjectTypeDisplay(project?.projectType),
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

function toDrawerComment(comment, user) {
  const commentType = comment.commentType || "general";

  return {
    ...decorateCommentForDisplay(comment, user),
    commentType,
    id: comment.id,
    image: comment.image,
    imageComment: ["image", "viewer3d", "video"].includes(commentType),
    imageId: comment.targetId || comment.imageId,
    message: comment.content,
    pointNumber:
      commentType === "viewer3d"
        ? Number(comment.pointNumber ?? comment.targetMetadata?.pointNumber) ||
          null
        : null,
    createdAt: comment.createdAt,
    parentCommentId: comment.parentCommentId,
    projectId: comment.projectId,
    selection: comment.selection,
    targetId: comment.targetId,
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
  const { projectId: routeProjectSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout, user } = useAuth();
  const currentUser = getUserDisplay(user);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [isProjectRequestModalOpen, setIsProjectRequestModalOpen] =
    useState(false);
  const parsedRouteProjectId = Number(routeProjectSlug);
  const routeUsesNumericProjectId =
    Number.isInteger(parsedRouteProjectId) && parsedRouteProjectId > 0;
  const initialProjectId = Number.isInteger(Number(providedProject?.id))
    ? Number(providedProject.id)
    : routeUsesNumericProjectId
      ? parsedRouteProjectId
      : null;
  const [project, setProject] = useState(providedProject);
  const [projectError, setProjectError] = useState("");
  const [projectLoading, setProjectLoading] = useState(!providedProject);
  const [filesSynchronizedAt, setFilesSynchronizedAt] = useState(() =>
    providedProject ? new Date().toISOString() : null,
  );
  const [resolvedProjectId, setResolvedProjectId] = useState(initialProjectId);
  const [projectComments, setProjectComments] = useState([]);
  const [projectCommentsError, setProjectCommentsError] = useState("");
  const [projectCommentsLoading, setProjectCommentsLoading] = useState(false);
  const [activeProjectTabIndex, setActiveProjectTabIndex] = useState(
    searchParams.get("tab") === "renders" ? 1 : initialActiveProjectTabIndex,
  );
  const imageCommentNotifications = useImageCommentNotifications({
    projectIds: resolvedProjectId ? [resolvedProjectId] : [],
    refreshIntervalMs: isNotificationsDrawerOpen ? 5000 : 15000,
  });
  const notificationComments = mergeNotificationComments([
    ...projectComments.map((comment) => toDrawerComment(comment, user)),
    ...imageCommentNotifications,
  ]);

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
    if (providedProject) {
      if (!providedProject && !initialProjectId) {
        setProjectError("El identificador del proyecto no es válido.");
        setProjectLoading(false);
      }
      return undefined;
    }

    let isMounted = true;
    setProjectLoading(true);
    setProjectError("");

    if (!initialProjectId) {
      api.projects
        .getByIdAllFiles({ projectId: routeProjectSlug })
        .then((data) => {
          if (!isMounted || !data?.project) {
            return;
          }

          setProject(data.project);
          setFilesSynchronizedAt(new Date().toISOString());
          setResolvedProjectId(data.project.id);
        })
        .catch((error) => {
          if (isMounted) {
            setProject(null);
            setResolvedProjectId(null);
            setProjectError(
              error.message || "No se pudo cargar la informacion del proyecto.",
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
    }

    api.projects
      .getByIdAllFiles({ projectId: initialProjectId })
      .then((data) => {
        if (isMounted) {
          const nextProject = data.project || null;
          setProject(nextProject);
          setFilesSynchronizedAt(new Date().toISOString());
          setResolvedProjectId(nextProject?.id || initialProjectId);

          if (routeUsesNumericProjectId && nextProject) {
            navigate(getProjectPath(nextProject, searchParams.toString()), {
              replace: true,
            });
          }
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
  }, [
    initialProjectId,
    navigate,
    providedProject,
    routeProjectSlug,
    routeUsesNumericProjectId,
    searchParams,
  ]);

  useEffect(() => {
    if (!resolvedProjectId) {
      setProjectComments([]);
      return undefined;
    }

    let isMounted = true;

    function loadProjectComments({ showLoading = false } = {}) {
      if (showLoading) {
        setProjectCommentsLoading(true);
      }

      setProjectCommentsError("");

      api.projects
        .listAllComments({ projectId: resolvedProjectId })
        .then((data) => {
          if (isMounted) {
            setProjectComments(
              (current) =>
                mergeCommentsById(
                  current,
                  Array.isArray(data.comments) ? data.comments : [],
                ),
            );
          }
        })
        .catch((error) => {
          if (isMounted) {
            setProjectCommentsError(
              error.message || "No se pudieron cargar las observaciones.",
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
    const refreshIntervalId = window.setInterval(
      () => loadProjectComments(),
      isNotificationsDrawerOpen ? 5000 : 15000,
    );

    return () => {
      isMounted = false;
      window.clearInterval(refreshIntervalId);
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
        navigate(
          project && project.id === selectedProjectId
            ? getProjectPath(project)
            : `/proyectos/${selectedProjectId}`,
        );
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
    navigate(
      project
        ? getProjectPath(project, params.toString())
        : `/proyectos/${resolvedProjectId}?${params.toString()}`,
    );
  };

  const clearFocusedRenderComment = useCallback(() => {
    if (!searchParams.has("imageId") && !searchParams.has("commentId")) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("imageId");
    nextParams.delete("commentId");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const refreshProjectFiles = useCallback(async () => {
    if (!resolvedProjectId) {
      return;
    }

    try {
      const data = await api.projects.getByIdAllFiles({ projectId: resolvedProjectId });
      setProject(data.project || null);
      setFilesSynchronizedAt(new Date().toISOString());
    } catch {
      // Keep the current project visible if a background refresh fails.
    }
  }, [resolvedProjectId]);

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
        error.message || "No se pudo guardar la observación.",
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
        onClearFocusedComment={clearFocusedRenderComment}
        projectId={resolvedProjectId}
        renderGallery={presentedProject.renderGallery}
        videoGallery={presentedProject.videoGallery}
      />
    );
  } else if (activeProjectTabIndex === 2) {
    activeProjectPanel = (
      <ProjectDocumentsPanel
        documents={presentedProject.documents}
        lastSynchronizedAt={filesSynchronizedAt}
      />
    );
  } else if (activeProjectTabIndex === 3) {
    activeProjectPanel = <ProjectTrackingPanel {...trackingProps} />;
  } else if (activeProjectTabIndex === 4) {
    activeProjectPanel = <ProjectWarrantiesPanel {...warrantiesProps} />;
  } else if (activeProjectTabIndex === 5) {
    activeProjectPanel = (
      <ProjectUploadFilesPanel
        projectId={resolvedProjectId}
        onFilesChanged={refreshProjectFiles}
      />
    );
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

          <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-[48px] px-[48px] pb-[24px] pt-0">
            {projectLoading ? (
              <Loader
                preset="projectDetail"
                section={PROJECT_DETAIL_LOADER_SECTIONS[activeProjectTabIndex] || "info"}
                label="Cargando proyecto"
              />
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
                <TabPanel
                  transitionKey={`${presentedProject.id}-${activeProjectTabIndex}`}
                  className="w-full"
                >
                  {activeProjectPanel}
                </TabPanel>
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
