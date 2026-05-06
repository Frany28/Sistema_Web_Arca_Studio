import { useState } from "react";
import DropdownMenu from "../../../../components/ui/DropdownMenu/DropdownMenu.jsx";
import Label from "../../../../components/ui/Label/Label.jsx";
import Tooltip from "../../../../components/ui/Tooltip/Tooltip.jsx";

function ComparisonCard({ item }) {
  const [selectedItemId, setSelectedItemId] = useState(item.selectedOptionId);
  const selectedLabel =
    item.options.find((option) => option.id === selectedItemId)?.label ??
    item.options[0]?.label ??
    "";

  return (
    <article className="flex min-w-0 flex-1 flex-col gap-[12px]">
      <div className="relative h-[350px] w-full overflow-hidden rounded-[var(--radius-2)]">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.12)_40%,rgba(0,0,0,0.56)_100%)]" />
        <p className="absolute bottom-[10px] left-[10px] text-heading-8 text-[var(--color-neutral-100-uniform)]">
          {item.title}
        </p>
      </div>

      <DropdownMenu
        type="Text"
        label={selectedLabel}
        supportingText=""
        items={item.options}
        selectedItemId={selectedItemId}
        onItemSelect={(option) => setSelectedItemId(option.id)}
        interactive
        className="w-full max-w-[320px]"
        aria-label={`Etapa para ${item.title}`}
      />
    </article>
  );
}

export default function ProjectTrackingComparisonGallery({ items = [] }) {
  return (
    <section className="flex w-full flex-col gap-[16px]">
      <div className="flex items-center">
        <Tooltip
          text="Compara las distintas etapas del proyecto."
          showTip
          tipPosition="Top center"
        >
          <Label
            label="Comparativa de resultados"
            required={false}
            information
            state="Focused"
            aria-label="Información sobre comparativa"
          />
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-2">
        {items.map((item) => (
          <ComparisonCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
