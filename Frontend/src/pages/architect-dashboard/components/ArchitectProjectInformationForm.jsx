import { useState } from "react";

import DropdownMenu from "../../../components/ui/DropdownMenu/DropdownMenu.jsx";
import HintText from "../../../components/ui/HintText/HintText.jsx";
import Input from "../../../components/ui/Input/Input.jsx";
import Label from "../../../components/ui/Label/Label.jsx";
import TextArea from "../../../components/ui/TextArea/TextArea.jsx";

const PROJECT_TYPE_ITEMS = [
  { id: "residential", label: "Residencial", type: "Text" },
  { id: "commercial", label: "Comercial", type: "Text" },
  { id: "corporate", label: "Corporativo", type: "Text" },
];

const AREA_EXAMPLE = `Ej.
  • Habitación principal: 18 mts
  • Habitaciones secundarias: 15mts c/u
  • Cocina: 10 mts
  • Sala:
  • Comedor:...`;

function RequiredInput({ label, placeholder, className, size = "M" }) {
  return (
    <Input
      label={label}
      required
      showLabelInfo={false}
      showHint={false}
      size={size}
      type="Default input"
      placeholder={placeholder}
      showLeftIcon={false}
      showRightIcon={false}
      className={className}
    />
  );
}

function ProjectTextArea({ label }) {
  return (
    <TextArea
      label={label}
      required={false}
      showLabelInfo
      showHint
      hintText="Describe las medidas exactas o aproximadas cada área."
      placeholder={AREA_EXAMPLE}
      rows={5}
      minHeight={102}
      resize={false}
      className="w-full max-w-none"
      textareaClassName="whitespace-pre-wrap"
    />
  );
}

function ArchitectProjectInformationForm() {
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [isProjectTypeMenuOpen, setIsProjectTypeMenuOpen] = useState(false);

  return (
    <form className="flex w-full max-w-[656px] flex-col gap-[16px]">
      <RequiredInput
        label="Nombre del proyecto"
        placeholder='Ej. “Apto. Noventa y Uno”'
        size="M"
        className="!w-[320px] !max-w-[320px]"
      />

      <div className="flex w-[320px] max-w-full flex-col gap-[8px]">
        <Label label="Tipo de proyecto" required information={false} />
        <DropdownMenu
          type="Text"
          label="Selecciona tipo de proyecto"
          supportingText=""
          items={PROJECT_TYPE_ITEMS}
          selectedItemId={selectedProjectType}
          open={isProjectTypeMenuOpen}
          onOpenChange={setIsProjectTypeMenuOpen}
          onItemSelect={(item) => {
            setSelectedProjectType(item.id);
            setIsProjectTypeMenuOpen(false);
          }}
          interactive
          className="w-full"
          aria-label="Seleccionar tipo de proyecto"
        />
      </div>

      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[16px]">
        <RequiredInput
          label="Área general"
          placeholder='Ej. “Apto. Noventa y Uno”'
          size="L"
          className="!w-full !max-w-none"
        />
        <RequiredInput
          label="Área de construcción"
          placeholder='Ej. “Apto. Noventa y Uno”'
          size="L"
          className="!w-full !max-w-none"
        />
      </div>

      <RequiredInput
        label="Ubicación del proyecto"
        placeholder='Ej. “MC83+862, Calle 78 Dr. Portillo, Maracaibo 4001, Zulia”'
        size="L"
        className="!w-full !max-w-none"
      />

      <ProjectTextArea label="Zonificación" />
      <ProjectTextArea label="Procedimientos" />
      <ProjectTextArea label="Condiciones" />
      <ProjectTextArea label="Equipo utilizado" />

      <HintText
        state="Default"
        hintText="Todos los campos marcados con * son obligatorios."
        className="sr-only"
      />
    </form>
  );
}

export default ArchitectProjectInformationForm;
