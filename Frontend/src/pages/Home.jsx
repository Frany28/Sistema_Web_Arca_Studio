import NavigationBar from "../components/ui/NavigationBar/NavigationBar.jsx";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";
import { getUserDisplay } from "../auth/userDisplay.js";
import AvatarGroup from "../components/ui/AvatarGroup/AvatarGroup.jsx";
import Button from "../components/ui/Button/Button.jsx";
import NotificationsDrawer from "../components/ui/NotificationsDrawer.jsx";
import ProjectRequestModal from "../components/ui/ProjectRequestModal.jsx";
import ProjectsShowcaseCarousel from "../components/ui/ProjectsShowcaseCarousel.jsx";
import ScrollBar from "../components/ui/ScrollBar/ScrollBar.jsx";
import SideNavigation from "../components/ui/SideNavigation/SideNavigation.jsx";
import fondoActualizarContrasena from "../assets/fondos/Property 1=actualizar contraseña.png";
import fondoNotificacion from "../assets/fondos/Property 1=notificacion.png";
import fondoRestablecerContrasena from "../assets/fondos/Property 1=restablecer contraseña.png";
import fondoVariante2 from "../assets/fondos/Property 1=Variant2.png";
import {
  CLIENT_DRAWER_COMMENTS,
  CLIENT_DRAWER_RECENT_ACTIVITY,
} from "./clientDrawerData.js";

const EXPANDED_SIDEBAR_WIDTH = 312;
const COLLAPSED_SIDEBAR_WIDTH = 76;
const TABLET_BREAKPOINT_PX = 768;
const PROJECT_ITEMS = [
  {
    id: "stand-nexar",
    title: "Stand Nexar 2026",
    image: fondoVariante2,
  },
  {
    id: "torre-nexar",
    title: "Torre Nexar 2026",
    image: fondoNotificacion,
  },
  {
    id: "casa-nexar",
    title: "Casa Nexar 2026",
    image: fondoVariante2,
  },
];

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
    image: fondoActualizarContrasena,
  },
  {
    id: "aura-living-1",
    title: "Stand Aura 2026",
    image: fondoRestablecerContrasena,
  },
  {
    id: "aura-kitchen-2",
    title: "Stand Aura 2026",
    image: fondoNotificacion,
  },
  {
    id: "aura-bathroom-2",
    title: "Stand Aura 2026",
    image: fondoActualizarContrasena,
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
    image: fondoActualizarContrasena,
  },
  {
    id: "aura-living-2",
    title: "Stand Aura 2026",
    image: fondoRestablecerContrasena,
  },
  {
    id: "aura-kitchen-4",
    title: "Stand Aura 2026",
    image: fondoNotificacion,
  },
  {
    id: "aura-bathroom-4",
    title: "Stand Aura 2026",
    image: fondoActualizarContrasena,
  },
];

function ProjectRow({ title, image }) {
  const navigate = useNavigate();

  return (
    <article className="flex items-center gap-[24px] border-b border-[var(--color-neutral-200)] px-0 py-[16px]">
      <div className="h-[80px] w-[140px] shrink-0 overflow-hidden rounded-[var(--radius-2)]">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="text-heading-4 text-[var(--color-text-50)]">
            {title}
          </h2>
          <AvatarGroup
            size="S"
            items={[
              {
                content: "Icon",
                theme: "Neutral",
              },
              {
                content: "Text",
                theme: "Neutral",
                initials: "AC",
              },
            ]}
          />
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
        onClick={() => navigate("/proyectos/quinta-bella-vista")}
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
  const projectsContainerRef = useRef(null);
  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const formattedTodayLabel =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

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
  }, []);

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

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex min-h-screen w-full items-stretch">
        <SideNavigation
          activeItemId="dashboard"
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
              {PROJECT_ITEMS.map((project) => (
                <ProjectRow
                  key={project.id}
                  title={project.title}
                  image={project.image}
                />
              ))}
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

          <div className="mx-auto flex w-full max-w-[1200px] px-[48px] pb-[24px]">
            <ProjectsShowcaseCarousel items={PROJECT_SHOWCASE_ITEMS} />
          </div>

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
            comments={CLIENT_DRAWER_COMMENTS}
            recentActivity={CLIENT_DRAWER_RECENT_ACTIVITY}
            onActivitySelect={handleActivitySelect}
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
