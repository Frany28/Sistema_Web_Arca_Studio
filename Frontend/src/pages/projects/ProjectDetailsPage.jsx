import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavigationBar from "../../components/ui/NavigationBar/NavigationBar.jsx";
import NotificationsDrawer from "../../components/ui/NotificationsDrawer.jsx";
import ProjectRequestModal from "../../components/ui/ProjectRequestModal.jsx";
import SideNavigation from "../../components/ui/SideNavigation/SideNavigation.jsx";
import ProjectDetailTabMenu from "./components/ProjectDetailTabMenu.jsx";
import ProjectOverviewHeader from "./components/ProjectOverviewHeader.jsx";
import ProjectDocumentsPanel from "./panels/ProjectDocumentsPanel.jsx";
import ProjectInfoPanel from "./panels/ProjectInfoPanel.jsx";
import ProjectRendersPanel from "./panels/ProjectRendersPanel.jsx";
import ProjectTrackingPanel from "./panels/ProjectTrackingPanel.jsx";
import { PROJECT_DETAIL_DATA } from "./projectDetailsData.js";

const TABLET_BREAKPOINT_PX = 768;

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [isProjectRequestModalOpen, setIsProjectRequestModalOpen] =
    useState(false);
  const [activeProjectTabIndex, setActiveProjectTabIndex] = useState(0);

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
      navigate("/dashboard-clientes-vacio");
      return;
    }

    if (item?.id === "settings") {
      navigate("/configuraciones");
    }
  };

  let activeProjectPanel = <ProjectInfoPanel />;

  if (activeProjectTabIndex === 1) {
    activeProjectPanel = <ProjectRendersPanel />;
  } else if (activeProjectTabIndex === 2) {
    activeProjectPanel = <ProjectDocumentsPanel />;
  } else if (activeProjectTabIndex === 3) {
    activeProjectPanel = <ProjectTrackingPanel />;
  }

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex min-h-screen w-full items-stretch">
        <SideNavigation
          activeItemId="project-1"
          expanded={isSidebarExpanded}
          onExpandedChange={setIsSidebarExpanded}
          onItemSelect={handleSideNavigationSelect}
          onNewOpportunityClick={() => setIsProjectRequestModalOpen(true)}
          onLogoutClick={() => navigate("/")}
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
            <ProjectOverviewHeader project={PROJECT_DETAIL_DATA} />
            <ProjectDetailTabMenu
              activeIndex={activeProjectTabIndex}
              onChange={setActiveProjectTabIndex}
            />
            {activeProjectPanel}
          </div>

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
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
