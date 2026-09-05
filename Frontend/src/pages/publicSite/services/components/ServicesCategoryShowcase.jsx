import { useRef, useState } from "react";
import { motion as Motion } from "motion/react";

import "./ServicesCategoryShowcase.css";

function ServicesCategoryShowcase({ categories }) {
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
      className="flex min-h-dvh w-full items-center justify-center bg-[var(--color-neutral-950-uniform)] px-[16px] py-[96px] min-[768px]:px-[48px]"
      aria-label="Tipos de diseño"
      viewport={{ amount: 0.15, once: true }}
      onViewportEnter={() => {
        if (commercialCategory) setActiveCategoryId(commercialCategory.id);
      }}
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
            <span
              className={`services-category-line absolute left-0 top-0 block h-[4px] origin-top-left rotate-90 bg-[var(--color-accent-300)] ${
                commercialIsActive ? "services-category-line-enter" : ""
              }`}
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
                className="text-heading-4 w-fit cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-accent-300)]"
                onClick={() => setActiveCategoryId(category.id)}
                onKeyDown={(event) => handleCategoryKeyDown(event, index)}
              >
                <span
                  className={`block ${
                    category.id === "commercial"
                      ? `services-category-commercial ${
                          commercialIsActive
                            ? "services-category-commercial-enter"
                            : ""
                        }`
                      : `services-category-residential ${
                          commercialIsActive
                            ? "services-category-residential-exit"
                            : ""
                        }`
                  }`}
                  data-node-id={
                    category.id === "commercial"
                      ? "4571:111488"
                      : "4571:111487"
                  }
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="relative aspect-[272/452] w-full max-w-[272px] justify-self-center overflow-hidden"
          role="tabpanel"
          id="services-category-panel"
          aria-labelledby={`service-tab-${activeCategory.id}`}
        >
          <img
            className="absolute inset-0 size-full object-cover object-bottom"
            src={residentialCategory.image}
            alt={commercialIsActive ? "" : residentialCategory.imageAlt}
            aria-hidden={commercialIsActive}
          />
          {commercialCategory ? (
            <img
              className={`services-category-commercial-image absolute inset-0 size-full object-cover object-bottom ${
                commercialIsActive
                  ? "services-category-commercial-image-enter"
                  : ""
              }`}
              src={commercialCategory.image}
              alt={commercialIsActive ? commercialCategory.imageAlt : ""}
              aria-hidden={!commercialIsActive}
              data-node-id="4571:111500"
            />
          ) : null}
        </div>
      </div>
    </Motion.section>
  );
}

export default ServicesCategoryShowcase;
