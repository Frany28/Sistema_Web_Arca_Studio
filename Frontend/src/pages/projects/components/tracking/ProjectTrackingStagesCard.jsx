import { useEffect, useRef } from "react";

import { TickSquareIcon } from "./ProjectTrackingIcons.jsx";

function StageDot({ status }) {
  if (status === "completed") {
    return (
      <span className="inline-flex size-[32px] items-center justify-center rounded-full border border-[var(--color-primary-300)] bg-[var(--color-primary-300)] text-[var(--color-neutral-100-uniform)]">
        <TickSquareIcon className="size-[18px]" />
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="relative inline-flex size-[32px] items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[12px] leading-[14px] text-[var(--color-text-300)] shadow-[0px_2px_4px_0px_rgba(27,28,29,0.04),0_0_0_4px_var(--color-primary-10)] dark:shadow-none">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-[var(--color-text-300)]"
        />
        01
      </span>
    );
  }

  return (
    <span className="inline-flex size-[32px] items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[12px] leading-[14px] text-[var(--color-text-100)]">
      01
    </span>
  );
}

function StageStep({ item, stepRef }) {
  return (
    <li
      ref={stepRef}
      className="relative z-10 flex w-[220px] shrink-0 items-start gap-[8px]"
    >
      <StageDot status={item.status} />
      <div className="flex min-w-0 flex-col gap-[4px] pt-[1px] tracking-[-0.5px]">
        <p
          className={`truncate text-[14px] font-normal leading-[17px] ${
            item.status === "active"
              ? "text-[var(--color-text-300)]"
              : item.status === "completed"
                ? "text-[var(--color-text-200)]"
                : "text-[var(--color-text-100)]"
          }`}
        >
          {item.title}
        </p>
        <p
          className={`truncate text-[12px] font-normal leading-[14px] ${
            item.status === "active"
              ? "text-[var(--color-text-300)]"
              : item.status === "completed"
                ? "text-[var(--color-text-100)]"
                : "text-[var(--color-neutral-400)]"
          }`}
        >
          {item.subtitle}
        </p>
      </div>
    </li>
  );
}

function getCurrentStageIndex(stages) {
  const activeIndex = stages.findIndex((item) => item.status === "active");

  if (activeIndex >= 0) {
    return activeIndex;
  }

  for (let index = stages.length - 1; index >= 0; index -= 1) {
    if (stages[index]?.status === "completed") {
      return index;
    }
  }

  return 0;
}

export default function ProjectTrackingStagesCard({ stages = [] }) {
  const listRef = useRef(null);
  const trackRef = useRef(null);
  const progressLineRef = useRef(null);
  const stepRefs = useRef([]);
  const currentStageIndex = getCurrentStageIndex(stages);

  useEffect(() => {
    const listElement = listRef.current;
    const trackElement = trackRef.current;
    const progressLineElement = progressLineRef.current;
    const firstStep = stepRefs.current[0];
    const currentStep = stepRefs.current[currentStageIndex];
    const lastStep = stepRefs.current[stages.length - 1];

    if (
      !listElement ||
      !trackElement ||
      !progressLineElement ||
      !firstStep ||
      !currentStep ||
      !lastStep
    ) {
      return undefined;
    }

    const listRect = listElement.getBoundingClientRect();
    const firstRect = firstStep.getBoundingClientRect();
    const currentRect = currentStep.getBoundingClientRect();
    const lastRect = lastStep.getBoundingClientRect();
    const dotCenterOffset = 16;
    const progressTop = firstRect.top - listRect.top + dotCenterOffset + 1;
    const progressEnd = Math.max(
      currentRect.top - listRect.top + dotCenterOffset,
      progressTop,
    );
    const lastCenter = lastRect.top - listRect.top + dotCenterOffset;
    const progressHeight = Math.max(progressEnd - progressTop, 0);
    const trackHeight = Math.max(lastCenter - progressEnd, 0);

    trackElement.style.top = `${progressEnd}px`;
    trackElement.style.height = `${trackHeight}px`;
    progressLineElement.style.top = `${progressTop}px`;
    progressLineElement.style.height = "0px";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progressLineElement.style.height = `${progressHeight}px`;
      return undefined;
    }

    const animation = progressLineElement.animate(
      [
        { height: "0px" },
        { height: `${progressHeight}px` },
      ],
      {
        duration: 900,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    return () => {
      animation.cancel();
    };
  }, [currentStageIndex, stages]);

  return (
    <section className="flex h-[336px] min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
      <h3 className="text-heading-8 text-[var(--color-text-200)]">
        Etapas del Proyecto
      </h3>

      <div className="mt-[16px] flex min-h-0 flex-1 items-start justify-between gap-[16px]">
        <ul ref={listRef} className="relative flex shrink-0 flex-col gap-[24px]">
          <span
            ref={trackRef}
            aria-hidden="true"
            className="absolute left-[15px] top-[17px] h-[204px] w-[2px] rounded-full bg-[var(--color-neutral-200)]"
          />
          <span
            ref={progressLineRef}
            aria-hidden="true"
            className="absolute left-[15px] top-[17px] h-0 w-[2px] rounded-full bg-[var(--color-primary-300)]"
          />
          {stages.map((item, index) => (
            <StageStep
              key={item.id}
              item={item}
              stepRef={(element) => {
                stepRefs.current[index] = element;
              }}
            />
          ))}
        </ul>

        <div className="flex h-[252px] shrink-0 flex-col items-end justify-between">
          {stages.map((item) => (
            <p
              key={`${item.id}-date`}
              className="text-heading-8 text-[var(--color-text-100)]"
            >
              {item.dateRange}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
