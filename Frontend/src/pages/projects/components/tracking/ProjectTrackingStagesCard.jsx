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
      <span className="inline-flex size-[32px] items-center justify-center rounded-full border border-[var(--color-text-300)] bg-[var(--color-neutral-100)] text-[12px] leading-[14px] text-[var(--color-text-300)]">
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

function StageStep({ item }) {
  return (
    <li className="relative z-10 flex w-[220px] shrink-0 items-start gap-[8px]">
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

export default function ProjectTrackingStagesCard({ stages = [] }) {
  return (
    <section className="flex h-[336px] min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
      <h3 className="text-heading-8 text-[var(--color-text-200)]">
        Etapas del Proyecto
      </h3>

      <div className="mt-[16px] flex min-h-0 flex-1 items-start justify-between gap-[16px]">
        <ul className="relative flex shrink-0 flex-col gap-[24px]">
          <span
            aria-hidden="true"
            className="absolute left-[15px] top-[49px] h-[204px] w-[2px] bg-[var(--color-neutral-200)]"
          />
          <span
            aria-hidden="true"
            className="absolute left-[15px] top-[17px] h-[32px] w-[2px] bg-[var(--color-primary-300)]"
          />
          {stages.map((item) => (
            <StageStep key={item.id} item={item} />
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
