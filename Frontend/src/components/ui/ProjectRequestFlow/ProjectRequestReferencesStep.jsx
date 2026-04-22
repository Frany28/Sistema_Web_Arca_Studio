import FileUploadSection from "../FileUploadSection.jsx";
import Input from "../Input/Input.jsx";
import Label from "../Label/Label.jsx";
import ProjectRequestModalShell from "./ProjectRequestModalShell.jsx";

function LinkIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.72499 10C2.06665 9.20833 1.66666 8.19167 1.66666 7.08333C1.66666 4.56667 3.72499 2.5 6.24999 2.5H10.4167C12.9333 2.5 15 4.56667 15 7.08333C15 9.6 12.9417 11.6667 10.4167 11.6667H8.33332"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.275 10.0002C17.9333 10.7918 18.3333 11.8085 18.3333 12.9168C18.3333 15.4335 16.275 17.5002 13.75 17.5002H9.58333C7.06667 17.5002 5 15.4335 5 12.9168C5 10.4002 7.05833 8.3335 9.58333 8.3335H11.6667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectRequestReferencesStep({
  open,
  onClose,
  onPrevious,
  onNext,
  values,
  onReferenceLinkChange,
}) {
  return (
    <ProjectRequestModalShell
      open={open}
      sectionTitle="Referencias"
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      nextLabel="Siguiente"
    >
      <div className="flex w-full flex-col gap-[16px]">
        <div className="flex w-full flex-col gap-[8px]">
          <Label
            label="Subir imágenes / archivos (opcional)"
            required={false}
            information={false}
          />
          <FileUploadSection
            className="w-full"
            files={[]}
            showUploadedFiles={false}
            viewportHeight={null}
          />
        </div>

        <Input
          label="Link de referencia (Pinterest, web, etc.)"
          required={false}
          showLabelInfo={false}
          showHint={false}
          size="S"
          type="Default input"
          placeholder='Ej. “https://es.pinterest.com/pin”'
          leftIcon={<LinkIcon className="size-5" />}
          rightIcon={null}
          showLeftIcon
          showRightIcon={false}
          value={values.referenceLink}
          onChange={(event) => onReferenceLinkChange?.(event.target.value)}
          className="w-full max-w-none"
        />
      </div>
    </ProjectRequestModalShell>
  );
}

export default ProjectRequestReferencesStep;
