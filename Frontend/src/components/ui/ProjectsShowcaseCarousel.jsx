import { useEffect, useRef, useState } from "react";

import MainLogo from "../../assets/logos/MainLogo.jsx";
import AvatarGroup from "./AvatarGroup/AvatarGroup.jsx";
import Button from "./Button/Button.jsx";

const SHOWCASE_COLUMNS_PER_PAGE = 3;
const SHOWCASE_ITEMS_PER_PAGE = SHOWCASE_COLUMNS_PER_PAGE * 2;
const CARD_WIDTH = 328;

const CARD_HEIGHTS = {
  tallLeft: 334,
  shortLeft: 195,
  shortCenter: 197,
  tallCenter: 334,
  tallRight: 333,
  shortRight: 195,
};

const SHOWCASE_COLUMN_HEIGHTS = [
  [CARD_HEIGHTS.tallLeft, CARD_HEIGHTS.shortLeft],
  [CARD_HEIGHTS.shortCenter, CARD_HEIGHTS.tallCenter],
  [CARD_HEIGHTS.tallRight, CARD_HEIGHTS.shortRight],
];

function ChevronLeftIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.5 15L12.5 10L7.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectShowcaseCard({ title, image, height, assigneeAvatars = [] }) {
  return (
    <article
      className="group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[12px] p-[16px] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${height}px`,
      }}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.20)_0%,rgba(0,0,0,0.10)_38%,rgba(0,0,0,0.62)_100%)]" />

      <div className="relative z-[1] flex w-full items-start justify-start">
        <MainLogo
          size="24px"
          appearance="dark"
          alt="ARCA Studio"
          className="shrink-0"
        />
      </div>

      <div className="relative z-[1] flex w-full min-w-0 flex-col items-start gap-[10px]">
        <h3 className="line-clamp-2 text-[24px] font-bold leading-[30px] tracking-[-0.5px] text-[var(--color-neutral-100-uniform)]">
          {title}
        </h3>

        <div className="flex w-full min-w-0 items-center justify-between gap-[10px]">
          {assigneeAvatars.length ? (
            <AvatarGroup
              size="S"
              items={assigneeAvatars}
              className="[&>span]:border-[rgba(255,255,255,0.18)] [&>span]:shadow-none"
            />
          ) : (
            <span aria-hidden="true" />
          )}

          <Button
            theme="Primary"
            type="Solid"
            size="S"
            fitContent
            showLeftIcon={false}
            showRightIcon={false}
            className="shrink-0 !rounded-[8px] !bg-[rgba(36,36,36,0.88)] !px-[12px] !py-[8px] !text-[12px] !font-medium !leading-[16px] !text-white hover:!bg-[rgba(48,48,48,0.95)]"
          >
            Ver más
          </Button>
        </div>
      </div>
    </article>
  );
}

function buildShowcasePages(items) {
  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) {
    return [];
  }

  const pages = [];

  for (
    let itemIndex = 0;
    itemIndex < safeItems.length;
    itemIndex += SHOWCASE_ITEMS_PER_PAGE
  ) {
    const slice = safeItems.slice(
      itemIndex,
      itemIndex + SHOWCASE_ITEMS_PER_PAGE,
    );

    const columns = SHOWCASE_COLUMN_HEIGHTS.map(() => []);

    slice.forEach((item, index) => {
      const columnIndex = index % SHOWCASE_COLUMNS_PER_PAGE;
      const rowIndex = Math.floor(index / SHOWCASE_COLUMNS_PER_PAGE);
      const fallbackHeight = CARD_HEIGHTS.tallLeft;
      const height =
        SHOWCASE_COLUMN_HEIGHTS[columnIndex]?.[rowIndex] ?? fallbackHeight;

      columns[columnIndex].push({
        ...item,
        height,
      });
    });

    pages.push(columns.filter((column) => column.length > 0));
  }

  return pages;
}

function ProjectsShowcaseCarousel({ title = "Ver más proyectos", items = [] }) {
  const showcaseRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const pages = buildShowcasePages(items);

  useEffect(() => {
    const container = showcaseRef.current;

    if (!container || !pages.length) {
      return undefined;
    }

    function syncActivePage() {
      const containerWidth = container.clientWidth;

      if (!containerWidth) {
        return;
      }

      const nextPage = Math.round(container.scrollLeft / containerWidth);
      setActivePage(Math.max(0, Math.min(nextPage, pages.length - 1)));
    }

    syncActivePage();
    window.addEventListener("resize", syncActivePage);

    return () => {
      window.removeEventListener("resize", syncActivePage);
    };
  }, [pages.length]);

  const handleNavigation = (direction) => {
    const container = showcaseRef.current;

    if (!container) {
      return;
    }

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

  if (!pages.length) {
    return null;
  }

  return (
    <section className="flex w-full min-w-0 flex-col items-start gap-[16px] self-stretch">
      <div className="flex w-full items-center justify-between gap-[12px]">
        <h2 className="text-[24px] font-bold leading-[30px] tracking-[-0.5px] text-[var(--color-text-100)]">
          {title}
        </h2>

        {pages.length > 1 ? (
          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              aria-label="Proyecto anterior"
              onClick={() => handleNavigation(-1)}
              disabled={activePage === 0}
              className="cursor-pointer flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[var(--color-text-200)] transition-all duration-200 hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon className="size-4" />
            </button>

            <button
              type="button"
              aria-label="Proyecto siguiente"
              onClick={() => handleNavigation(1)}
              disabled={activePage >= pages.length - 1}
              className="cursor-pointer flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[var(--color-text-200)] transition-all duration-200 hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="w-full min-w-0 overflow-hidden">
        <div
          ref={showcaseRef}
          className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const containerWidth = event.currentTarget.clientWidth;

            if (!containerWidth) {
              return;
            }

            const nextPage = Math.round(
              event.currentTarget.scrollLeft / containerWidth,
            );

            setActivePage(Math.max(0, Math.min(nextPage, pages.length - 1)));
          }}
        >
          {pages.map((columns, pageIndex) => (
            <div
              key={`showcase-page-${pageIndex}`}
              className="flex min-w-full snap-start items-start gap-[16px]"
            >
              {columns.map((column, columnIndex) => (
                <div
                  key={`showcase-column-${pageIndex}-${columnIndex}`}
                  className=" cursor-pointer flex w-[328px] shrink-0 flex-col gap-[16px]"
                >
                  {column.map((project, itemIndex) => (
                    <ProjectShowcaseCard
                      key={`${project.id}-${pageIndex}-${columnIndex}-${itemIndex}`}
                      title={project.title}
                      image={project.image}
                      height={project.height}
                      assigneeAvatars={project.assigneeAvatars}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsShowcaseCarousel;
