import IconContainer from "./ui/IconContainer/IconContainer.jsx";

function AdminKpiMetric({ icon, iconType, label, value }) {
  return (
    <article className="flex w-[235px] min-w-[120px] shrink-0 items-center gap-[12px] pr-[16px]">
      <IconContainer size="L" type={iconType} icon={icon} />
      <div className="flex min-w-0 flex-col items-start justify-center gap-[2px]">
        <h2 className="text-heading-8 m-0 whitespace-nowrap text-[var(--color-text-100)]">{label}</h2>
        <strong className="text-heading-4 whitespace-nowrap text-[var(--color-text-200)]">{value}</strong>
      </div>
    </article>
  );
}

export default AdminKpiMetric;
