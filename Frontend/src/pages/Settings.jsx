import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavigationBar from "../components/ui/NavigationBar/NavigationBar.jsx";
import NotificationsDrawer from "../components/ui/NotificationsDrawer.jsx";
import ProjectRequestModal from "../components/ui/ProjectRequestModal.jsx";
import SideNavigation from "../components/ui/SideNavigation/SideNavigation.jsx";

const EXPANDED_SIDEBAR_WIDTH = 312;
const COLLAPSED_SIDEBAR_WIDTH = 76;
const TABLET_BREAKPOINT_PX = 768;

function Settings() {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [isProjectRequestModalOpen, setIsProjectRequestModalOpen] =
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
      navigate("/dashboard-clientes");
      return;
    }

    if (item?.id === "settings") {
      navigate("/configuraciones");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex min-h-screen w-full">
        <SideNavigation
          activeItemId="settings"
          expanded={isSidebarExpanded}
          onExpandedChange={setIsSidebarExpanded}
          onItemSelect={handleSideNavigationSelect}
          onNewOpportunityClick={() => setIsProjectRequestModalOpen(true)}
          onLogoutClick={() => navigate("/")}
          className="h-screen min-h-screen max-h-screen"
        />

        <div
          className="relative min-w-0 self-stretch overflow-y-auto transition-[width] duration-300 ease-out"
          style={{
            height: "100vh",
            width: `calc(100% - ${
              isSidebarExpanded
                ? EXPANDED_SIDEBAR_WIDTH
                : COLLAPSED_SIDEBAR_WIDTH
            }px)`,
          }}
        >
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between self-stretch border-b border-[var(--color-neutral-200)]">
            <NavigationBar
              variant="utility"
              utilityText={formattedTodayLabel}
              utilityActionActive={isNotificationsDrawerOpen}
              onUtilityActionClick={() =>
                setIsNotificationsDrawerOpen((current) => !current)
              }
              className="w-full max-w-[1200px] px-[var(--spacing-spacing-gap-8,48px)] py-[var(--spacing-spacing-gap-4,12px)]"
            />
          </div>

          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[16px] px-[48px] py-[16px]">
            <p className="w-full text-heading-6 text-[var(--color-text-300)]">
              Configuraciones
            </p>

            <section className="flex min-h-[240px] w-full flex-col gap-[12px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[24px] py-[24px]">
              <h2 className="text-heading-6 text-[var(--color-text-200)]">
                Área de configuración
              </h2>
              <p className="max-w-[480px] text-body-3 text-[var(--color-text-100)]">
                Esta ruta ya está conectada desde la navegación lateral y
                mantiene el mismo layout base del dashboard.
              </p>
            </section>
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

export default Settings;
