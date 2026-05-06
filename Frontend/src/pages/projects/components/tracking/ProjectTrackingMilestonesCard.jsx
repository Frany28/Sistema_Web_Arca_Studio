import IconContainer from "../../../../components/ui/IconContainer.jsx";
import Label from "../../../../components/ui/Label/Label.jsx";
import { CalendarIcon } from "./ProjectTrackingIcons.jsx";

function MilestoneRow({ item, withDivider }) {
  return (
    <li
      className={`flex items-center justify-between gap-[12px] pb-[12px] ${
        withDivider ? "border-b border-[var(--color-neutral-200)]" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-[8px]">
        <IconContainer
          size="S"
          type="Outline"
          icon={
            <CalendarIcon
              size={16}
              className="text-[var(--color-text-200)]"
            />
          }
        />
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
      <Label label="Próximos Hitos" required={false} information={false} />
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
