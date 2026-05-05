import { CalendarIcon } from "./ProjectTrackingIcons.jsx";

function MilestoneRow({ item, withDivider }) {
  return (
    <li
      className={`flex items-center justify-between gap-[12px] pb-[12px] ${
        withDivider ? "border-b border-[var(--color-neutral-200)]" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-[8px]">
        <span className="inline-flex size-[32px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-text-200)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)]">
          <CalendarIcon className="size-[16px]" />
        </span>
        <p className="truncate text-heading-8 text-[var(--color-text-200)]">
          {item.label}
        </p>
      </div>
      <p className="shrink-0 text-heading-8 text-[var(--color-text-100)]">
        {item.date}
      </p>
    </li>
  );
}

export default function ProjectTrackingMilestonesCard({ items = [] }) {
  return (
    <aside className="w-full min-w-0 lg:w-[390px]">
      <h3 className="text-heading-8 text-[var(--color-text-200)]">
        Próximos Hitos
      </h3>
      <ul className="mt-[12px] space-y-[12px] py-[12px]">
        {items.map((item, index) => (
          <MilestoneRow
            key={item.id}
            item={item}
            withDivider={index < items.length - 1}
          />
        ))}
      </ul>
    </aside>
  );
}
