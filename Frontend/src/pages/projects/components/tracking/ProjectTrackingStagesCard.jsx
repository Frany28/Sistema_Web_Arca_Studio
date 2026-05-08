import { useEffect, useRef } from "react";

import EmptyState from "../../../../components/ui/EmptyState.jsx";
import ProgressStepBase from "../../../../components/ui/ProgressStepBase.jsx";

const STAGE_STATUS_TO_PROGRESS_STATE = {
  completed: "Completed",
  active: "Active",
  pending: "Incomplete",
};

function StageStep({ item, stepRef }) {
  return (
    <li ref={stepRef} className="relative z-10 w-[220px] shrink-0">
      <ProgressStepBase
        type="Numbered"
        state={STAGE_STATUS_TO_PROGRESS_STATE[item.status] ?? "Incomplete"}
        size="S"
        layout="Inline"
        title={item.title}
        subtext={item.subtitle}
        number="01"
        className="w-[220px]"
        aria-label={item.title}
      />
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
  const hasStages = Array.isArray(stages) && stages.length > 0;

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

      {hasStages ? (
        <div className="mt-[16px] flex min-h-0 flex-1 items-start justify-between gap-[16px]">
          <ul
            ref={listRef}
            className="relative flex shrink-0 flex-col gap-[24px]"
          >
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
      ) : (
        <EmptyState
          className="min-h-0 flex-1"
          title="Título Principal"
          showSecondaryAction={false}
        />
      )}
    </section>
  );
}
