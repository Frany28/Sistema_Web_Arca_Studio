import { useEffect, useRef, useState } from "react";

import MainLogo from "../../assets/logos/MainLogo.jsx";
import AvatarGroup from "./AvatarGroup/AvatarGroup.jsx";
import Button from "./Button/Button.jsx";

const SHOWCASE_COLUMNS_PER_PAGE = 3;
const SHOWCASE_ITEMS_PER_PAGE = SHOWCASE_COLUMNS_PER_PAGE * 2;

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

function ProjectShowcaseCard({ title, image, variant = "tall" }) {
  const isTall = variant === "tall";

  return (
    <article
      className={`group relative flex w-full max-w-[328px] flex-col justify-between self-stretch overflow-hidden rounded-[var(--radius-2)] p-[var(--spacing-spacing-gap-5,16px)] text-white shadow-[0_0_5px_0_rgba(0,0,0,0.05)] xl:max-w-none ${
        isTall ? "h-[334px]" : "h-[197px]"
      }`}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_10%,rgba(0,0,0,0.06)_54%,rgba(0,0,0,0.58)_100%)]" />

      <div className="relative z-[1] flex w-full items-start justify-start">
        <MainLogo
          size="32px"
          alt="ARCA Studio"
          className="h-[32px] w-auto shrink-0"
          imgClassName="h-8 w-auto brightness-0 invert"
        />
      </div>

      <div className="relative z-[1] flex w-full flex-col items-start gap-[12px]">
        <h3 className="text-[18px] font-bold leading-[22px] tracking-[-0.5px] text-white sm:text-[24px] sm:leading-[30px]">
          {title}
        </h3>

        <div className="flex w-full items-center justify-between gap-[12px]">
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
            className="[&>span]:border-[var(--color-neutral-bg)] [&>span]:shadow-[0_0_5px_0_rgba(0,0,0,0.05)]"
          />

          <Button
            theme="Primary"
            type="Solid"
            size="M"
            fitContent
            showLeftIcon={false}
            showRightIcon={false}
            className="shrink-0"
          >
            Ver mas
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
    const slice = safeItems.slice(itemIndex, itemIndex + SHOWCASE_ITEMS_PER_PAGE);

    while (slice.length < SHOWCASE_ITEMS_PER_PAGE) {
      slice.push(
        safeItems[slice.length % safeItems.length] ?? safeItems[0],
      );
    }

    pages.push([
      [
        { ...slice[0], variant: "tall" },
        { ...slice[1], variant: "short" },
      ],
      [
        { ...slice[2], variant: "short" },
        { ...slice[3], variant: "tall" },
      ],
      [
        { ...slice[4], variant: "tall" },
        { ...slice[5], variant: "short" },
      ],
    ]);
  }

  return pages;
}

function ProjectsShowcaseCarousel({
  title = "Ver mas proyectos",
  items = [],
}) {
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
    <section className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-[16px] px-[48px] pb-[40px] pt-[8px]">
      <div className="flex w-full items-center justify-between gap-[16px]">
        <h2 className="text-[40px] font-bold leading-[44px] tracking-[-1.2px] text-[var(--color-text-100)]">
          {title}
        </h2>

        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            aria-label="Proyecto anterior"
            onClick={() => handleNavigation(-1)}
            disabled={activePage === 0}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[var(--radius-2)] border border-[var(--color-neutral-300)] bg-[var(--color-neutral-bg)] text-[var(--color-primary-200)] transition-all duration-200 hover:border-[var(--color-neutral-600)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Proyecto siguiente"
            onClick={() => handleNavigation(1)}
            disabled={activePage >= pages.length - 1}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[var(--radius-2)] border border-[var(--color-neutral-300)] bg-[var(--color-neutral-bg)] text-[var(--color-primary-200)] transition-all duration-200 hover:border-[var(--color-neutral-600)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-[1_0_0] flex-col items-start gap-[var(--spacing-spacing-gap-5,16px)] self-stretch overflow-hidden p-[var(--spacing-spacing-gap-0,0)]">
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
            setActivePage(nextPage);
          }}
        >
          {pages.map((columns, pageIndex) => (
            <div
              key={`showcase-page-${pageIndex}`}
              className="grid min-w-full flex-[1_0_0] snap-start grid-cols-1 items-start gap-[16px] self-stretch md:grid-cols-2 xl:grid-cols-3"
            >
              {columns.map((column, columnIndex) => (
                <div
                  key={`showcase-column-${pageIndex}-${columnIndex}`}
                  className="flex flex-[1_0_0] flex-col items-start gap-[16px] self-stretch"
                >
                  {column.map((project) => (
                    <ProjectShowcaseCard
                      key={`${project.id}-${pageIndex}-${columnIndex}-${project.variant}`}
                      title={project.title}
                      image={project.image}
                      variant={project.variant}
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
