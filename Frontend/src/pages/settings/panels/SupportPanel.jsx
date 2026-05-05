import Button from "../../../components/ui/Button/Button.jsx";
import DropdownMenu from "../../../components/ui/DropdownMenu/DropdownMenu.jsx";
import FileUploadSection from "../../../components/ui/FileUploadSection/FileUploadSection.jsx";
import HintText from "../../../components/ui/HintText/HintText.jsx";
import Input from "../../../components/ui/Input/Input.jsx";
import TextArea from "../../../components/ui/TextArea/TextArea.jsx";
import { InfoCircleIcon } from "../settingsIcons.jsx";

export default function SupportPanel({
  supportIssueType,
  setSupportIssueType,
  isSupportIssueTypeMenuOpen,
  setIsSupportIssueTypeMenuOpen,
  supportSubject,
  setSupportSubject,
  supportDescription,
  setSupportDescription,
  onSubmit,
}) {
  const supportIssueItems = [
    {
      id: "platform-error",
      label: "Error en la plataforma",
      type: "Checkbox",
      checked: supportIssueType === "platform-error" ? "Yes" : "No",
    },
    {
      id: "access-account",
      label: "Acceso o cuenta",
      type: "Checkbox",
      checked: supportIssueType === "access-account" ? "Yes" : "No",
    },
    {
      id: "files-documents",
      label: "Archivos o documentos",
      type: "Checkbox",
      checked: supportIssueType === "files-documents" ? "Yes" : "No",
    },
    {
      id: "guarantees",
      label: "Garantías",
      type: "Checkbox",
      checked: supportIssueType === "guarantees" ? "Yes" : "No",
    },
    {
      id: "other",
      label: "Otro",
      type: "Checkbox",
      checked: supportIssueType === "other" ? "Yes" : "No",
    },
  ];
  const selectedSupportIssue =
    supportIssueItems.find((item) => item.id === supportIssueType) ?? null;

  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <div className="relative flex w-[664px] max-w-full flex-col gap-[24px]">
        <div className="flex w-full flex-col gap-[2px] border-b border-[var(--color-neutral-200)] pb-[24px]">
          <h2 className="text-[24px] font-bold leading-[30px] tracking-[-0.5px] text-[var(--color-text-300)]">
            Contactar Soporte
          </h2>
          <p className="w-[340px] max-w-full text-[16px] leading-[19px] tracking-[-0.5px] text-[var(--color-text-200)]">
            Nuestro equipo te ayudará lo antes posible.
          </p>
        </div>

        <div className="flex w-full items-start justify-between">
          <span className="pt-[2px] text-heading-8 tracking-[-0.5px] text-[var(--color-text-300)]">
            Tipo de problema
          </span>
                  <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <DropdownMenu
                type="Text"
                label={
                  selectedSupportIssue?.label ?? "Seleccionar tipo de problema"
                }
                supportingText=""
                items={supportIssueItems}
                selectedItemId={selectedSupportIssue?.id}
                open={isSupportIssueTypeMenuOpen}
                onOpenChange={setIsSupportIssueTypeMenuOpen}
                showDivider={isSupportIssueTypeMenuOpen}
                onItemSelect={(item) => {
                  setSupportIssueType(item.id);
                  setIsSupportIssueTypeMenuOpen(false);
                }}
                interactive
                className="w-[320px]"
                aria-label="Seleccionar tipo de problema"
              />
              <HintText
                state="Default"
                hintText="Esto nos ayuda a dirigir tu solicitud correctamente"
                leftIcon={<InfoCircleIcon className="size-4" />}
                className="w-[320px] items-start [&>p]:whitespace-normal [&>p]:break-words"
              />
            </div>
            <Input
              label="Asunto"
              required
              information={false}
              showLabelInfo={false}
              showHint={false}
              size="S"
              type="Default input"
              state={supportSubject ? "Filled" : "Default"}
              value={supportSubject}
              placeholder="Ej. No puedo visualizar los renders"
              onChange={(event) => setSupportSubject(event.target.value)}
              className="w-[320px] max-w-none"
            />
          </div>
        </div>

        <div className="flex w-full items-start justify-between">
          <div />
          <div className="flex w-[325px] max-w-none flex-col gap-[8px]">
            <TextArea
              label="Descripción"
              required
              information={false}
              showLabelInfo={false}
              showHint={false}
              value={supportDescription}
              placeholder="Describe el problema con el mayor detalle posible. Puedes incluir qué ocurrió, cuándo sucedió y qué esperabas que pasara."
              onChange={(event) => setSupportDescription(event.target.value)}
              minHeight={106}
              rows={5}
              className="!w-full !max-w-none"
            />
            <HintText
              state="Default"
              hintText="Mientras más detalles proporciones, más rápido podremos ayudarte."
              leftIcon={<InfoCircleIcon className="size-4" />}
              className="w-full items-start [&>p]:whitespace-normal [&>p]:break-words"
            />
          </div>
        </div>

        <div className="h-px w-full bg-[var(--color-neutral-200)]" />

          <div className="flex w-full items-start justify-between gap-[16px]">
            <span className="pt-[2px] text-heading-8 tracking-[-0.5px] text-[var(--color-text-300)]">
              Imagen de referencia (opcional)
            </span>
          <div className="w-[447px]">
            <FileUploadSection
              className="h-[177px] w-full"
              title="Imagen de referencia"
              chooseFileLabel="Elige un archivo"
              separatorLabel="O"
              dropLabel="Arrastra y suelta"
              formatsLabel="Formatos JPEG, PNG, PDF y MP4, hasta 50 MB."
              files={[]}
              showUploadedFiles={false}
              viewportHeight={null}
            />
          </div>
        </div>

        <div className="h-px w-full bg-[var(--color-neutral-200)]" />

        <div className="flex w-full justify-end">
          <Button
            theme="Primary"
            type="Solid"
            size="S"
            fitContent
            showLeftIcon={false}
            showRightIcon={false}
            onClick={onSubmit}
          >
            Enviar solicitud
          </Button>
        </div>
      </div>
    </div>
  );
}
