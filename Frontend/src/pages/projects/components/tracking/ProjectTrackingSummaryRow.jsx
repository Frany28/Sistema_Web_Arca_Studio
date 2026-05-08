import CircleProgressBarLabel from "../../../../components/ui/CircleProgressBarLabel/CircleProgressBarLabel.jsx";
import IconContainer from "../../../../components/ui/IconContainer.jsx";
import { CalendarTickIcon, ClockIcon } from "./ProjectTrackingIcons.jsx";

function SummaryInfoCard({ icon, title, description, withDivider = false }) {
  return (
    <article
      className={`flex min-w-0 flex-col p-[16px] ${
        withDivider ? "border-r border-[var(--color-neutral-200)]" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-[16px]">
        <IconContainer size="M" type="Outline" icon={icon} />
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
    return (
      <CalendarTickIcon
        size={20}
        className="text-[var(--color-text-300)]"
      />
    );
  }

  return <ClockIcon size={20} className="text-[var(--color-text-300)]" />;
}

const EMPTY_SUMMARY_ITEMS = [
  {
    id: "overall-progress-empty",
    type: "progress",
    title: "Progreso General",
    description: "Sin información",
    value: 0,
  },
  {
    id: "last-update-empty",
    type: "info",
    icon: "clock",
    title: "Última actualización",
    description: "Sin información",
  },
  {
    id: "estimated-date-empty",
    type: "info",
    icon: "calendar-tick",
    title: "Fecha Estimada",
    description: "Sin información",
  },
];

export default function ProjectTrackingSummaryRow({ items = [] }) {
  const normalizedItems =
    Array.isArray(items) && items.length > 0 ? items : EMPTY_SUMMARY_ITEMS;
  const [progressItem, ...infoItems] = normalizedItems;

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
