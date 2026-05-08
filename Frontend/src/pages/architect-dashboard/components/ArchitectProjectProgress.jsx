import clsx from "clsx";

const PROJECT_STEPS = [
  {
    id: "survey",
    title: "Levantamiento",
    subtitle: "Completado",
    complete: true,
    titleClassName: "text-[var(--color-text-200)]",
    subtitleClassName: "text-[var(--color-text-100)]",
  },
  {
    id: "design",
    title: "Diseño",
    subtitle: "En proceso",
    complete: true,
    titleClassName: "text-[var(--color-text-300)]",
    subtitleClassName: "text-[var(--color-text-300)]",
  },
  {
    id: "execution",
    title: "Ejecución",
    subtitle: "Pendiente",
    complete: false,
    titleClassName: "text-[var(--color-text-100)]",
    subtitleClassName: "text-[var(--color-neutral-400)]",
  },
];

function ArchitectProjectProgress() {
  return (
    <div className="grid w-full grid-cols-1 gap-[16px] sm:grid-cols-3 sm:gap-[24px]">
      {PROJECT_STEPS.map((step) => (
        <div
          key={step.id}
          className={clsx(
            "flex min-w-0 flex-col gap-[2px] border-t-[4px] pt-[12px]",
            step.complete
              ? "border-[var(--color-accent-300)]"
              : "border-[var(--color-neutral-200)]",
          )}
        >
          <p className={clsx("text-body-3", step.titleClassName)}>
            {step.title}
          </p>
          <p className={clsx("text-body-4", step.subtitleClassName)}>
            {step.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ArchitectProjectProgress;
