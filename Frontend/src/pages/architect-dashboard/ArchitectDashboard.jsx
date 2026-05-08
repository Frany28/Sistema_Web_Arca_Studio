import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavigationBar from "../../components/ui/NavigationBar/NavigationBar.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";
import NotificationsDrawer from "../../components/ui/NotificationsDrawer.jsx";
import SideNavigation from "../../components/ui/SideNavigation/SideNavigation.jsx";
import {
  ARCHITECT_DRAWER_COMMENTS,
  ARCHITECT_DRAWER_RECENT_ACTIVITY,
  ARCHITECT_NAVIGATION_ITEMS,
  ARCHITECT_PROJECT_GROUPS,
} from "./architectDashboardData.js";
import ArchitectProjectGroup from "./components/ArchitectProjectGroup.jsx";

const TABLET_BREAKPOINT_PX = 768;

function ArchitectDashboard({ empty = false }) {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);

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
      navigate("/dashboard-arquitecto");
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

  const handleActivitySelect = (activity) => {
    if (!activity?.to) {
      return;
    }

    setIsNotificationsDrawerOpen(false);
    navigate(activity.to);
  };

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex min-h-screen w-full items-stretch">
        <SideNavigation
          activeItemId="dashboard"
          expanded={isSidebarExpanded}
          items={ARCHITECT_NAVIGATION_ITEMS}
          newOpportunityLabel="Nuevo proyecto"
          userName="Armando Carroz"
          userEmail="armandoc@arcastudio2025.com"
          onExpandedChange={setIsSidebarExpanded}
          onItemSelect={handleSideNavigationSelect}
          onNewOpportunityClick={() =>
            navigate("/dashboard-arquitecto/nuevo-proyecto")
          }
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

          <div className="mx-auto flex w-full max-w-[1200px] px-[48px] py-[16px]">
            <p className="text-heading-6 w-full text-[var(--color-text-300)]">
              Bienvenido, Arq. Armando
            </p>
          </div>

          {empty ? (
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
              {ARCHITECT_PROJECT_GROUPS.map((group) => (
                <ArchitectProjectGroup key={group.id} group={group} />
              ))}
            </div>
          )}

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
            comments={ARCHITECT_DRAWER_COMMENTS}
            recentActivity={ARCHITECT_DRAWER_RECENT_ACTIVITY}
            onActivitySelect={handleActivitySelect}
          />
        </div>
      </div>
    </main>
  );
}

export default ArchitectDashboard;
