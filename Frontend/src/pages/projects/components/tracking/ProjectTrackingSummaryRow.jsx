import CircleProgressBarLabel from "../../../../components/ui/CircleProgressBarLabel/CircleProgressBarLabel.jsx";
import { CalendarTickIcon, ClockIcon } from "./ProjectTrackingIcons.jsx";

function SummaryInfoCard({ icon, title, description, withDivider = false }) {
  return (
    <article
      className={`flex min-w-0 flex-col p-[16px] ${
        withDivider ? "border-r border-[var(--color-neutral-200)]" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-[16px]">
        <span className="inline-flex size-[56px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-text-300)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-heading-8 text-[var(--color-text-300)]">
            {title}
          </p>
          <p className="truncate text-body-4 text-[var(--color-text-200)]">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function SummaryProgressCard({ title, description, value }) {
  return (
    <article className="h-[88px] min-w-0 border-r border-[var(--color-neutral-200)] p-[16px]">
      <div className="flex h-full min-w-0 items-center gap-[16px]">
        <CircleProgressBarLabel
          size="S"
          value={value ?? 0}
          max={100}
          showText={false}
        />
        <div className="min-w-0">
          <p className="truncate text-heading-8 text-[var(--color-text-300)]">
            {title}
          </p>
          <p className="truncate text-body-4 text-[var(--color-text-200)]">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function getInfoIcon(iconKey) {
  if (iconKey === "calendar-tick") {
    return <CalendarTickIcon className="size-[28px]" />;
  }

  return <ClockIcon className="size-[28px]" />;
}

export default function ProjectTrackingSummaryRow({ items = [] }) {
  const [progressItem, ...infoItems] = items;

  return (
    <section className="grid w-full grid-cols-1 gap-0  border-[var(--color-neutral-200)] min-[1024px]:grid-cols-3">
      {progressItem ? (
        <SummaryProgressCard
          title={progressItem.title}
          description={progressItem.description}
          value={progressItem.value}
        />
      ) : null}

      {infoItems.map((item, index) => (
        <SummaryInfoCard
          key={item.id}
          icon={getInfoIcon(item.icon)}
          title={item.title}
          description={item.description}
          withDivider={index === 0}
        />
      ))}
    </section>
  );
}
