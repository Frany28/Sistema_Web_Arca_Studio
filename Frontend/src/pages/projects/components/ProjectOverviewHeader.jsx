import CircleProgressBarLabel from "../../../components/ui/CircleProgressBarLabel/CircleProgressBarLabel.jsx";

function getStageToneClasses(tone) {
  if (tone === "active") {
    return {
      bar: "bg-[var(--color-accent-300)]",
      title: "text-[var(--color-text-300)]",
      status: "text-[var(--color-text-300)]",
    };
  }

  if (tone === "completed") {
    return {
      bar: "bg-[var(--color-accent-300)]",
      title: "text-[var(--color-text-200)]",
      status: "text-[var(--color-text-100)]",
    };
  }

  return {
    bar: "bg-[var(--color-neutral-200)]",
    title: "text-[var(--color-text-100)]",
    status: "text-[var(--color-neutral-400)]",
  };
}

export default function ProjectOverviewHeader({ project }) {
  return (
    <section
      key={project.id}
      className="flex w-full flex-col gap-[16px]"
    >
      <div className="flex w-full items-start justify-between gap-[24px]">
        <div className="flex min-w-0 flex-col gap-[4px]">
          <h1 className="text-heading-3 text-[var(--color-text-50)]">
            {project.title}
          </h1>
          <p className="text-[18px] leading-[21px] tracking-[-0.5px] text-[var(--color-text-200)]">
            {project.category}
          </p>
        </div>

        <CircleProgressBarLabel
          size="M"
          value={project.progressValue}
          max={100}
          showText={false}
          aria-label={`Progreso del proyecto ${project.progressValue}%`}
          className="shrink-0"
        />
      </div>

      <div className="flex w-full gap-[24px]">
        {project.stages.map((stage, index) => {
          const toneClasses = getStageToneClasses(stage.tone);

          return (
            <div
              key={stage.id}
              className="flex min-w-0 flex-1 flex-col gap-[4px]"
            >
              <div
                className={`project-stage-progress-line h-[4px] w-full ${toneClasses.bar}`}
                style={{ animationDelay: `${120 + index * 100}ms` }}
                aria-hidden="true"
              />
              <p
                className={`mt-[12px] text-[16px] leading-[19px] tracking-[-0.5px] ${toneClasses.title}`}
              >
                {stage.title}
              </p>
              <p
                className={`text-[14px] leading-[17px] tracking-[-0.5px] ${toneClasses.status}`}
              >
                {stage.status}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
