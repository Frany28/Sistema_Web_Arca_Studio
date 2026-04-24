import Accordion from "../../../components/ui/Accordion/Accordion.jsx";
import {
  PROJECT_DETAIL_DATA,
  TECHNICAL_ACCORDIONS,
} from "../projectDetailsData.js";

function MapEmbed() {
  return (
    <div className="flex h-[300px] w-[1104px] max-w-full shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
      <iframe
        title="Mapa del proyecto"
        src="https://maps.google.com/maps?q=10.6653,-71.6026&z=15&output=embed"
        loading="lazy"
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function OverviewMetrics() {
  const overviewPairs = [
    {
      label: "Tipo",
      value: PROJECT_DETAIL_DATA.overview[0].value,
    },
    {
      label: PROJECT_DETAIL_DATA.overview[1].label,
      value: PROJECT_DETAIL_DATA.overview[1].value,
    },
    {
      label: PROJECT_DETAIL_DATA.overview[2].label,
      value: PROJECT_DETAIL_DATA.overview[2].value,
    },
  ];

  return (
    <div className="grid w-full grid-cols-[1fr_auto_1fr_auto_1fr_auto] items-center gap-x-[48px] border-b border-[var(--color-neutral-200)] py-[16px]">
      {overviewPairs.map((item) => (
        <div
          key={item.label}
          className="contents"
        >
          <span
            className="text-body-4 text-[var(--color-text-200)]"
          >
            {item.label}
          </span>
          <span
            className="justify-self-end text-body-3 font-bold text-[var(--color-text-300)]"
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function LocationRow() {
  return (
    <div className="flex w-full items-center justify-between border-b border-[var(--color-neutral-200)] py-[12px]">
      <span className="text-body-4 text-[var(--color-text-200)]">
        {PROJECT_DETAIL_DATA.location.label}
      </span>
      <span className="text-body-4 font-medium text-[var(--color-text-300)]">
        {PROJECT_DETAIL_DATA.location.value}
      </span>
    </div>
  );
}

function TechnicalAccordionDescription({ items }) {
  return (
    <ul className="list-disc pl-[18px] text-body-4 text-[var(--color-text-200)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function TechnicalSpecificationsSection() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
      <span className="text-body-4 text-[var(--color-text-200)]">
        Especificaciones Tecnicas
      </span>

      <div className="flex flex-col gap-[12px]">
        {TECHNICAL_ACCORDIONS.map((accordion) => (
          <Accordion
            key={accordion.id}
            title={accordion.title}
            description={
              <TechnicalAccordionDescription items={accordion.description} />
            }
            defaultOpen={accordion.defaultOpen}
            interactive
            className="rounded-[var(--radius-2)]"
          />
        ))}
      </div>
    </div>
  );
}

function RequirementsSection() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
      <span className="text-body-4 text-[var(--color-text-200)]">
        Requerimientos
      </span>

      <div className="border-t border-[var(--color-neutral-200)] pt-[8px]">
        <ul className="grid grid-cols-2 gap-x-[32px] gap-y-[8px] pl-[18px] text-body-4 font-medium text-[var(--color-text-300)]">
          {PROJECT_DETAIL_DATA.requirements.map((item, index) => (
            <li key={`${item}-${index}`} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ProjectInfoPanel() {
  return (
    <section className="flex w-full flex-col gap-[24px]">
      <OverviewMetrics />
      <LocationRow />
      <MapEmbed />

      <div className="flex w-full items-start gap-[16px] max-[1024px]:flex-col">
        <TechnicalSpecificationsSection />
        <RequirementsSection />
      </div>
    </section>
  );
}
