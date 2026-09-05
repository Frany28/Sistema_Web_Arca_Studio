import { useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";

const CATEGORY_TRANSITION_DURATION_SECONDS = 0.8;
const CATEGORY_TRANSITION_EASE = "easeInOut";
const CATEGORY_LINE_LENGTHS = Object.freeze({
  residential: 48,
  commercial: 108,
});

function ServicesCategoryShowcase({ categories }) {
  const reduceMotion = useReducedMotion();
  const categoryTabRefs = useRef([]);
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? "residential",
  );
  const transition = {
    duration: reduceMotion ? 0 : CATEGORY_TRANSITION_DURATION_SECONDS,
    ease: CATEGORY_TRANSITION_EASE,
  };
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ??
    categories[0];

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
    <section
      className="flex min-h-dvh w-full items-center justify-center bg-[var(--color-neutral-950-uniform)] px-[16px] py-[96px] min-[768px]:px-[48px]"
      aria-label="Tipos de diseño"
    >
      <div className="grid w-full max-w-[1200px] items-center gap-[64px] min-[768px]:grid-cols-[minmax(0,1fr)_272px] min-[1024px]:gap-[120px]">
        <div
          className="relative flex min-h-[108px] flex-col justify-between gap-[36px] pl-[32px]"
          role="tablist"
          aria-label="Seleccionar tipo de diseño"
          aria-orientation="vertical"
        >
          <span
            className="absolute left-0 top-0 h-[108px] w-[4px] overflow-hidden"
            aria-hidden="true"
          >
            <Motion.span
              className="absolute left-0 top-0 block h-[4px] origin-top-left rotate-90 bg-[var(--color-accent-300)]"
              initial={false}
              animate={{
                width:
                  CATEGORY_LINE_LENGTHS[activeCategoryId] ??
                  CATEGORY_LINE_LENGTHS.residential,
              }}
              transition={transition}
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
                aria-controls={`service-panel-${category.id}`}
                id={`service-tab-${category.id}`}
                tabIndex={isActive ? 0 : -1}
                ref={(node) => {
                  categoryTabRefs.current[index] = node;
                }}
                className="text-heading-4 w-fit cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-accent-300)]"
                onClick={() => setActiveCategoryId(category.id)}
                onKeyDown={(event) => handleCategoryKeyDown(event, index)}
              >
                <Motion.span
                  className="block"
                  initial={false}
                  animate={{
                    color: isActive
                      ? "var(--color-accent-300)"
                      : "var(--color-neutral-100-uniform)",
                  }}
                  transition={transition}
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
          className="relative aspect-[272/452] w-full max-w-[272px] justify-self-center overflow-hidden"
          role="tabpanel"
          id={`service-panel-${activeCategory.id}`}
          aria-labelledby={`service-tab-${activeCategory.id}`}
        >
          {categories.map((category, index) => (
            <Motion.img
              key={category.id}
              className="absolute inset-0 size-full object-cover object-bottom"
              src={category.image}
              alt={category.imageAlt}
              initial={false}
              animate={{ opacity: category.id === activeCategoryId ? 1 : 0 }}
              transition={transition}
              aria-hidden={category.id !== activeCategoryId}
              data-node-id={
                category.id === "commercial" ? "4571:111500" : undefined
              }
              style={{ zIndex: index + 1 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export {
  CATEGORY_LINE_LENGTHS,
  CATEGORY_TRANSITION_DURATION_SECONDS,
  CATEGORY_TRANSITION_EASE,
};
export default ServicesCategoryShowcase;
