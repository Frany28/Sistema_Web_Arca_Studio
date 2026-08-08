import Accordion from "../../../components/ui/Accordion/Accordion.jsx";
import Avatar from "../../../components/ui/Avatar/Avatar.jsx";
import Button from "../../../components/ui/Button/Button.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import FileAttachmentIcons from "../../../components/ui/FileAttachmentIcons/FileAttachmentIcons.jsx";
import Tooltip from "../../../components/ui/Tooltip/Tooltip.jsx";
import { getProjectTypeLabel } from "../../../utils/projectTypeDisplay.js";

function InfoEmptyState({ title, description, className = "" }) {
  return (
    <EmptyState
      title={title}
      description={description}
      size="S"
      showFeaturedIcon
      showActions
      showSecondaryAction={false}
      primaryActionLabel="Actualizar"
      className={className}
    />
  );
}

function MapEmbed({ coordinates, empty = false }) {
  if (empty || !coordinates) {
    return (
      <div className="flex h-[240px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-10)] min-[480px]:h-[300px]">
        <InfoEmptyState
          title="No está disponible la ubicación"
          description="Actualiza la página e inténtalo de nuevo."
          className="h-auto min-h-[254px]"
        />
      </div>
    );
  }

  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${coordinates.latitude},${coordinates.longitude}`,
  )}&z=15&output=embed`;

  return (
    <div className="flex h-[240px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] min-[480px]:h-[300px]">
      <iframe
        title="Mapa del proyecto"
        src={mapUrl}
        loading="lazy"
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function formatArea(value, unit) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const unitLabels = {
    m2: "m²",
    sqm: "m²",
    square_meters: "m²",
  };

  return `${value} ${unitLabels[unit] || unit || "m²"}`;
}

function OverviewMetrics({ project, empty = false }) {
  const overviewPairs = [
    {
      label: "Tipo",
      value: empty ? "-" : getProjectTypeLabel(project?.projectType),
    },
    {
      label: "Área General",
      value: empty ? "-" : formatArea(project?.generalArea, project?.areaUnit),
    },
    {
      label: "Área de Construcción",
      value: empty
        ? "-"
        : formatArea(project?.constructionArea, project?.areaUnit),
    },
  ];

  return (
    <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[16px] border-b border-[var(--color-neutral-200)] py-[8px] min-[768px]:grid-cols-[1fr_auto_1fr_auto_1fr_auto] min-[768px]:gap-x-[24px] min-[768px]:py-[16px] min-[1280px]:gap-x-[48px]">
      {overviewPairs.map((item) => (
        <div key={item.label} className="contents">
          <span className="min-w-0 break-words py-[8px] text-body-4 text-[var(--color-text-200)] min-[768px]:py-0">
            {item.label}
          </span>
          <span className="max-w-full break-words py-[8px] text-right text-body-3 font-bold text-[var(--color-text-300)] min-[768px]:py-0">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function LocationRow({ project, empty = false }) {
  return (
    <div className="flex w-full flex-col items-start gap-[4px] border-b border-[var(--color-neutral-200)] py-[12px] min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-[16px]">
      <span className="text-body-4 text-[var(--color-text-200)]">
        Ubicación
      </span>
      <span className="max-w-full break-words text-body-4 font-medium text-[var(--color-text-300)] min-[480px]:text-right">
        {empty ? "-" : project?.locationFormattedAddress || project?.location || "-"}
      </span>
    </div>
  );
}

function QuestionTooltipIcon() {
  return (
    <Tooltip
      portal
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

function TechnicalSpecificationsSection({
  empty = false,
  technicalSpecifications = [],
}) {
  const isEmpty = empty || technicalSpecifications.length === 0;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-[12px]">
      <span className="text-body-4 text-[var(--color-text-200)]">
        Especificaciones Técnicas
      </span>

      {isEmpty ? (
        <InfoEmptyState
          title="Aún no hay información"
          description="Esta sección describe las herramientas y tecnologías utilizadas en el proyecto, asegurando transparencia."
          className="min-h-[254px]"
        />
      ) : (
        <div className="flex flex-col gap-[12px]">
          {technicalSpecifications.map((specification) => {
            const content = specification.items?.length
              ? specification.items.map((item) => item.content)
              : specification.description;

            return (
              <Accordion
                key={specification.id}
                title={specification.title}
                description={
                  <TechnicalAccordionDescription content={content} />
                }
                defaultOpen={specification.defaultOpen}
                interactive
                className="rounded-[var(--radius-2)]"
                rightIcon={<QuestionTooltipIcon />}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequirementsSection({ empty = false, requirements = [] }) {
  const requirementLabels = requirements.map(
    (requirement) => requirement.description,
  );
  const midpoint = Math.ceil(requirementLabels.length / 2);
  const requirementColumns = [
    requirementLabels.slice(0, midpoint),
    requirementLabels.slice(midpoint),
  ];
  const isEmpty = empty || requirementLabels.length === 0;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-[12px]">
      <span className="text-body-4 text-[var(--color-text-200)]">
        Requerimientos
      </span>

      {isEmpty ? (
        <InfoEmptyState
          title="Aún no hay requerimientos"
          description="Esta sección detalla las características especificadas para el proyecto."
          className="min-h-[254px]"
        />
      ) : (
        <div className="flex min-h-px flex-1 flex-wrap items-start gap-[16px] p-[12px]">
          {requirementColumns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className="flex min-w-0 flex-1 basis-full flex-col gap-[16px] min-[600px]:min-w-[220px] min-[600px]:basis-0"
            >
              {column.map((item, itemIndex) => (
                <ul key={`${item}-${itemIndex}`} className="block">
                  <li className="ms-[24px] break-words list-disc text-[14px] font-bold leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)] min-[768px]:text-[16px] min-[768px]:leading-[19px]">
                    {item}
                  </li>
                </ul>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentDocumentsSection({
  documents = [],
  empty = false,
  onViewDocument,
}) {
  const hasDocuments = !empty && documents.length > 0;

  return (
    <section className="flex w-full min-w-0 flex-col gap-[12px]">
      <h2 className="sr-only">Documentos recientes</h2>

      {hasDocuments ? (
        <div className="flex w-full flex-col">
          {documents.slice(0, 3).map((document) => (
            <article
              key={document.id}
              className="flex w-full min-w-0 flex-wrap items-center gap-[12px] border-b border-[var(--color-neutral-200)] py-[16px] min-[600px]:flex-nowrap min-[768px]:gap-[24px]"
            >
              <div className="flex min-w-0 flex-[1_1_220px] items-center gap-[12px]">
                <FileAttachmentIcons
                  type={document.fileType}
                  className="h-[40px] w-[35px] shrink-0"
                />
                <div className="flex min-w-0 flex-col gap-[4px]">
                  <p className="break-words text-heading-8 text-[var(--color-text-300)] [overflow-wrap:anywhere]">
                    {document.name || "Documento"}
                  </p>
                  <p className="break-words text-body-3 text-[var(--color-text-100)]">
                    {document.size}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 max-w-full items-center gap-[8px]">
                <Avatar
                  size="S"
                  theme="Neutral"
                  content="Text"
                  name={document.owner}
                  decorative={false}
                />
                <span className="min-w-0 break-words text-[12px] leading-[14px] tracking-[-0.5px] text-[var(--color-text-300)] [overflow-wrap:anywhere] max-[479px]:sr-only">
                  {document.owner}
                </span>
              </div>

              <Button
                theme="Info"
                type="Outline"
                size="S"
                fitContent
                showLeftIcon={false}
                showRightIcon={false}
                className="ml-auto shrink-0"
                onClick={(event) =>
                  onViewDocument?.(document, event.currentTarget)
                }
              >
                Ver
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <InfoEmptyState
          title="Aún no hay documentos"
          description="Actualmente no hay documentación disponible para este proyecto. Por favor, revisa más tarde."
          className="min-h-[254px]"
        />
      )}
    </section>
  );
}

export default function ProjectInfoPanel({
  empty = false,
  onViewDocument,
  project,
}) {
  return (
    <section className="flex w-full min-w-0 flex-col gap-[24px]">
      <OverviewMetrics empty={empty} project={project} />
      <LocationRow empty={empty} project={project} />
      <MapEmbed empty={empty} coordinates={project?.locationCoordinates} />

      <div className="flex w-full min-w-0 flex-col items-start gap-[24px] min-[1024px]:flex-row min-[1024px]:gap-[16px]">
        <TechnicalSpecificationsSection
          empty={empty}
          technicalSpecifications={project?.technicalSpecifications}
        />
        <RequirementsSection
          empty={empty}
          requirements={project?.requirements}
        />
      </div>

      <RecentDocumentsSection
        documents={project?.recentDocuments}
        empty={empty}
        onViewDocument={onViewDocument}
      />

    </section>
  );
}
