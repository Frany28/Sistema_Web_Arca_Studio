import { useEffect, useMemo, useRef, useState } from "react";

import MainLogo from "../../assets/logos/MainLogo.jsx";
import {
  buildShowcasePages,
  getProjectTypeDisplay,
  getShowcaseCardHeight,
  getShowcaseLayout,
} from "../../utils/projectTypeDisplay.js";
import AvatarGroup from "./AvatarGroup/AvatarGroup.jsx";
import Button from "./Button/Button.jsx";
import ProjectImage from "./ProjectImage/ProjectImage.jsx";
import Tooltip from "./Tooltip/Tooltip.jsx";

const CARD_GAP = 24;

// Visual-only collaborator until projects expose a real assignedArchitects list.
const VISUAL_COLLABORATOR = {
  content: "Text",
  decorative: false,
  initials: "AC",
  name: "Arquitecto colaborador",
  theme: "Neutral",
};

function ChevronLeftIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProjectShowcaseCard({ globalIndex, layoutMode, project }) {
  const realAssignees = Array.isArray(project.assigneeAvatars)
    ? project.assigneeAvatars.slice(0, 1)
    : [];
  const displayAssignees = [...realAssignees, VISUAL_COLLABORATOR];
  const assigneeNames = displayAssignees.map((item) => item.name).join(", ");
  const cardHeight = getShowcaseCardHeight(layoutMode, globalIndex);

  return (
    <article
      className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-[var(--radius-2)] p-[16px] shadow-[var(--shadow-e1)]"
      style={{ height: `${cardHeight}px` }}
    >
      <ProjectImage
        src={project.image}
        alt={project.title}
        className="absolute inset-0 size-full"
        imageClassName="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.20)_0%,rgba(0,0,0,0.04)_48%,rgba(0,0,0,0.58)_100%)]" />

      <MainLogo
        size="20px"
        appearance="light"
        alt="ARCA Studio"
        className="absolute left-[16px] top-[16px] z-[1] h-[20px] w-[109px]"
        imgClassName="size-full"
      />

      <div className="relative z-[1] flex min-w-0 flex-col">
        <h3 className="truncate text-heading-4 text-[var(--color-neutral-100-uniform)]">
          {project.title}
        </h3>
        <p className="truncate text-body-1 text-[var(--color-neutral-100-uniform)]">
          {getProjectTypeDisplay(project.projectType)}
        </p>

        <div className="flex min-h-[41px] w-full min-w-0 items-center justify-between gap-[12px]">
          <Tooltip text={assigneeNames} tipPosition="Top center">
            <AvatarGroup
              size="S"
              items={displayAssignees}
              tabIndex={0}
              aria-label={`Encargados: ${assigneeNames}`}
              className="[&>span]:border-[var(--color-neutral-bg)] [&>span]:shadow-[var(--shadow-e1)]"
            />
          </Tooltip>

          <Button
            theme="Primary"
            type="Solid"
            size="M"
            fitContent
            showLeftIcon={false}
            showRightIcon={false}
            className="shrink-0"
          >
            Ver más
          </Button>
        </div>
      </div>
    </article>
  );
}

function ProjectsShowcaseCarousel({ title = "Ver más proyectos", items = [] }) {
  const showcaseRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const layout = getShowcaseLayout(viewportWidth, items.length);
  const indexedItems = useMemo(
    () => items.map((project, globalIndex) => ({ globalIndex, project })),
    [items],
  );
  const pages = useMemo(
    () => buildShowcasePages(indexedItems, layout.itemsPerPage),
    [indexedItems, layout.itemsPerPage],
  );

  useEffect(() => {
    const container = showcaseRef.current;

    if (!container) return undefined;

    const syncLayout = () => {
      setViewportWidth(window.innerWidth);
    };
    const frameId = window.requestAnimationFrame(syncLayout);
    const resizeObserver = new ResizeObserver(syncLayout);
    resizeObserver.observe(container);
    window.addEventListener("resize", syncLayout);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncLayout);
    };
  }, []);

  useEffect(() => {
    const container = showcaseRef.current;
    if (!container) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      setActivePage((currentPage) => {
        const nextPage = Math.max(
          0,
          Math.min(currentPage, Math.max(pages.length - 1, 0)),
        );
        container.scrollTo({
          left: container.clientWidth * nextPage,
          behavior: "auto",
        });
        return nextPage;
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [layout.mode, pages.length]);

  const handleNavigation = (direction) => {
    const container = showcaseRef.current;
    if (!container) return;

    const nextPage = Math.max(
      0,
      Math.min(activePage + direction, pages.length - 1),
    );
    container.scrollTo({
      left: container.clientWidth * nextPage,
      behavior: "smooth",
    });
    setActivePage(nextPage);
  };

  if (!pages.length) return null;

  return (
    <section className="flex w-full min-w-0 flex-col items-start gap-[16px] overflow-hidden rounded-[var(--radius-2)]">
      <div className="flex w-full items-center justify-between gap-[12px]">
        <h2 className="text-heading-4 text-[var(--color-text-100)]">{title}</h2>

        {pages.length > 1 ? (
          <div className="flex items-center gap-[8px]">
            <Button
              theme="Primary"
              type="Outline"
              size="S"
              showText={false}
              showLeftIcon
              showRightIcon={false}
              iconLeft={<ChevronLeftIcon className="size-5" />}
              aria-label="Proyectos anteriores"
              disabled={activePage === 0}
              onClick={() => handleNavigation(-1)}
            />
            <Button
              theme="Primary"
              type="Outline"
              size="S"
              showText={false}
              showLeftIcon
              showRightIcon={false}
              iconLeft={<ChevronRightIcon className="size-5" />}
              aria-label="Proyectos siguientes"
              disabled={activePage >= pages.length - 1}
              onClick={() => handleNavigation(1)}
            />
          </div>
        ) : null}
      </div>

      <div
        ref={showcaseRef}
        className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const width = event.currentTarget.clientWidth;
          if (!width) return;
          setActivePage(
            Math.max(
              0,
              Math.min(
                Math.round(event.currentTarget.scrollLeft / width),
                pages.length - 1,
              ),
            ),
          );
        }}
      >
        {pages.map((page, pageIndex) => (
          <div
            key={`showcase-page-${pageIndex}`}
            className="grid min-w-full snap-start"
            style={{
              gap: `${CARD_GAP}px`,
              gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
            }}
          >
            {page.map(({ globalIndex, project }) => (
              <ProjectShowcaseCard
                key={project.id}
                globalIndex={globalIndex}
                layoutMode={layout.mode}
                project={project}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProjectsShowcaseCarousel;
