import Accordion from "../../../components/ui/Accordion/Accordion.jsx";
import Tooltip from "../../../components/ui/Tooltip/Tooltip.jsx";
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
        <div key={item.label} className="contents">
          <span className="text-body-4 text-[var(--color-text-200)]">
            {item.label}
          </span>
          <span className="justify-self-end text-body-3 font-bold text-[var(--color-text-300)]">
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

function QuestionTooltipIcon() {
  return (
    <Tooltip
      text="Haz clic para desplegar la información."
      showTip
      tipPosition="Top center"
    >
      <span className="inline-flex size-[24px] items-center justify-center text-[var(--color-text-200)]">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-5"
          aria-hidden="true"
        >
          <path
            d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39762 14.6024 1.66666 10 1.66666C5.39763 1.66666 1.66667 5.39762 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M7.57501 7.50001C7.77085 6.94384 8.15715 6.4749 8.66546 6.17783C9.17377 5.88076 9.77094 5.77475 10.3499 5.87864C10.9289 5.98253 11.4525 6.28952 11.8282 6.74544C12.2038 7.20137 12.4074 7.77594 12.4025 8.36816C12.4025 10.0417 9.89168 10.8333 9.89168 10.8333"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 14.1667H10.0083"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Tooltip>
  );
}

function TechnicalAccordionDescription({ content }) {
  if (Array.isArray(content)) {
    return (
      <ul className="list-disc pl-[18px] text-body-4 text-[var(--color-text-200)]">
        {content.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return <p className="text-body-4 text-[var(--color-text-200)]">{content}</p>;
}

function TechnicalSpecificationsSection() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
      <span className="text-body-4 text-[var(--color-text-200)]">
        Especificaciones técnicas
      </span>

      <div className="flex flex-col gap-[12px]">
        {TECHNICAL_ACCORDIONS.map((accordion) => (
          <Accordion
            key={accordion.id}
            title={accordion.title}
            description={
              <TechnicalAccordionDescription content={accordion.description} />
            }
            defaultOpen={accordion.defaultOpen}
            interactive
            className="rounded-[var(--radius-2)]"
            rightIcon={<QuestionTooltipIcon />}
          />
        ))}
      </div>
    </div>
  );
}

function RequirementsSection() {
  const requirementColumns = [
    PROJECT_DETAIL_DATA.requirements.slice(0, 4),
    PROJECT_DETAIL_DATA.requirements.slice(4, 8),
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
      <span className="text-body-4 text-[var(--color-text-200)]">
        Requerimientos
      </span>

      <div className="flex min-h-px flex-1 flex-wrap items-start gap-[16px]  p-[12px]">
        {requirementColumns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex min-w-[220px] flex-1 flex-col gap-[16px]"
          >
            {column.map((item, itemIndex) => (
              <ul key={`${item}-${itemIndex}`} className="block">
                <li className="ms-[24px] list-disc text-[16px] font-bold leading-[19px] tracking-[-0.5px] text-[var(--color-text-200)]">
                  {item}
                </li>
              </ul>
            ))}
          </div>
        ))}
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
