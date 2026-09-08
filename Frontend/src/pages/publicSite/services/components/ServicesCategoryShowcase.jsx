import { useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";

const CATEGORY_TRANSITION_DURATION_SECONDS = 0.8;
const CATEGORY_TRANSITION_TIMES = [0, 1];
const CATEGORY_TRANSITION_EASE = "easeInOut";

function ServicesCategoryShowcase({ categories }) {
  const reduceMotion = useReducedMotion();
  const categoryTabRefs = useRef([]);
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? "residential",
  );
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ??
    categories[0];
  const residentialCategory =
    categories.find((category) => category.id === "residential") ?? categories[0];
  const commercialCategory =
    categories.find((category) => category.id === "commercial") ?? categories[1];
  const commercialIsActive = activeCategoryId === "commercial";
  const createPropertyTransition = (property) => ({
    [property]: {
      duration: reduceMotion ? 0 : CATEGORY_TRANSITION_DURATION_SECONDS,
      times: CATEGORY_TRANSITION_TIMES,
      ease: CATEGORY_TRANSITION_EASE,
    },
  });

  const handleCategoryKeyDown = (event, currentIndex) => {
    const lastIndex = categories.length - 1;
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    } else {
      return;
    }

    event.preventDefault();
    setActiveCategoryId(categories[nextIndex].id);
    categoryTabRefs.current[nextIndex]?.focus();
  };

  return (
    <Motion.section
      className="flex w-full items-center justify-center bg-[var(--color-neutral-950-uniform)] px-[16px] py-[48px] min-[768px]:px-[48px]"
      aria-label="Tipos de diseño"
      viewport={{ amount: 0.15, once: true }}
      onViewportEnter={() => {
        if (commercialCategory) setActiveCategoryId(commercialCategory.id);
      }}
    >
      <div
        className="flex w-full max-w-[1200px] flex-col items-center justify-center gap-[56px] min-[1024px]:flex-row"
        data-node-id="4613:2165"
      >
        <div
          className="relative flex w-full max-w-[514px] flex-col items-start gap-[24px] py-[48px] pl-[16px]"
          role="tablist"
          aria-label="Seleccionar tipo de diseño"
          aria-orientation="vertical"
        >
          <span
            className="absolute left-0 top-[48px] h-[108px] w-[4px] overflow-hidden"
            aria-hidden="true"
          >
            <Motion.span
              className="absolute left-0 top-0 block h-[4px] origin-top-left rotate-90 bg-[var(--color-accent-300)]"
              initial={false}
              animate={{ width: commercialIsActive ? 108 : 48 }}
              transition={createPropertyTransition("width")}
              data-node-id="4571:111485"
            />
          </span>

          {categories.map((category, index) => {
            const isActive = category.id === activeCategoryId;

            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="services-category-panel"
                id={`service-tab-${category.id}`}
                tabIndex={isActive ? 0 : -1}
                ref={(node) => {
                  categoryTabRefs.current[index] = node;
                }}
                className="text-heading-4 w-full cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-accent-300)]"
                onClick={() => setActiveCategoryId(category.id)}
                onKeyDown={(event) => handleCategoryKeyDown(event, index)}
              >
                <Motion.span
                  className="block"
                  initial={false}
                  animate={{ color: isActive ? "#FF4431" : "#FFF" }}
                  transition={createPropertyTransition("color")}
                  data-node-id={
                    category.id === "commercial"
                      ? "4571:111488"
                      : "4571:111487"
                  }
                >
                  {category.label}
                </Motion.span>
              </button>
            );
          })}
        </div>

        <div
          className="relative aspect-[16/25] w-full max-w-[320px] shrink-0 rounded-[var(--radius-4)] bg-[var(--color-primary-10)] p-[clamp(16px,6vw,24px)]"
          role="tabpanel"
          id="services-category-panel"
          aria-labelledby={`service-tab-${activeCategory.id}`}
          data-node-id="4571:111481"
        >
          <div className="relative size-full overflow-hidden rounded-[var(--radius-3)] bg-[var(--color-primary-300)]">
            <div className="absolute left-1/2 top-[47.92%] h-[108.58%] w-[118.79%] -translate-x-1/2 -translate-y-1/2">
              <img
                className="absolute left-[-173.55%] top-[-31.12%] h-[162.23%] w-[438.02%] max-w-none"
                src={residentialCategory.image}
                alt={commercialIsActive ? "" : residentialCategory.imageAlt}
                aria-hidden={commercialIsActive}
              />
            </div>
            {commercialCategory ? (
              <Motion.img
                className="absolute inset-0 size-full object-cover object-bottom"
                src={commercialCategory.image}
                alt={commercialIsActive ? commercialCategory.imageAlt : ""}
                initial={false}
                animate={{ opacity: commercialIsActive ? 1 : 0 }}
                transition={createPropertyTransition("opacity")}
                aria-hidden={!commercialIsActive}
                data-node-id="4571:111500"
              />
            ) : null}
          </div>
        </div>
      </div>
    </Motion.section>
  );
}

export {
  CATEGORY_TRANSITION_DURATION_SECONDS,
  CATEGORY_TRANSITION_EASE,
  CATEGORY_TRANSITION_TIMES,
};
export default ServicesCategoryShowcase;
