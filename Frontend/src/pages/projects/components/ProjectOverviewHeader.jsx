import CircleProgressBarLabel from "../../../components/ui/CircleProgressBarLabel/CircleProgressBarLabel.jsx";
import { getVisibleProjectStages } from "../../../utils/projectOverviewStages.js";

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
  const visibleStages = getVisibleProjectStages(project.stages);

  return (
    <section
      key={project.id}
      className="flex w-full flex-col gap-[16px]"
    >
      <div className="flex w-full items-start justify-between gap-[12px] min-[768px]:gap-[24px]">
        <div className="flex min-w-0 flex-col gap-[4px]">
          <h1 className="break-words text-[20px] font-bold leading-[24px] tracking-[-0.5px] text-[var(--color-text-50)] min-[768px]:text-heading-3">
            {project.title}
          </h1>
          <p className="break-words text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)] min-[768px]:text-[18px] min-[768px]:leading-[21px]">
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

      <div className="flex w-full gap-[12px] min-[480px]:gap-[24px]">
        {visibleStages.map((stage, index) => {
          const toneClasses = getStageToneClasses(stage.tone);

          return (
            <div
              key={stage.id}
              className={`${index >= 2 ? "hidden min-[768px]:flex" : "flex"} min-w-0 flex-1 flex-col gap-[4px]`}
            >
              <div
                className={`project-stage-progress-line h-[4px] w-full ${toneClasses.bar}`}
                style={{ animationDelay: `${120 + index * 100}ms` }}
                aria-hidden="true"
              />
              <p
                className={`mt-[8px] break-words text-[12px] leading-[15px] tracking-[-0.5px] min-[480px]:mt-[12px] min-[480px]:text-[14px] min-[480px]:leading-[17px] min-[768px]:text-[16px] min-[768px]:leading-[19px] ${toneClasses.title}`}
              >
                {stage.title}
              </p>
              <p
                className={`break-words text-[12px] leading-[15px] tracking-[-0.5px] min-[768px]:text-[14px] min-[768px]:leading-[17px] ${toneClasses.status}`}
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
