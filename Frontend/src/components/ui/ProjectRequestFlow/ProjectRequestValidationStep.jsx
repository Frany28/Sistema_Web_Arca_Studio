import HintText from "../HintText/HintText.jsx";
import Input from "../Input/Input.jsx";
import ProjectRequestModalShell from "./ProjectRequestModalShell.jsx";

function SecurityIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.0001 18.3333C9.32508 18.3333 8.65841 18.175 8.06675 17.8666L4.43341 16C2.82508 15.175 1.66675 13.3333 1.66675 11.525V6.39163C1.66675 5.34163 2.46675 4.14996 3.45008 3.75829L7.66675 2.03329C8.95008 1.50829 11.0584 1.50829 12.3417 2.03329L16.5584 3.75829C17.5334 4.15829 18.3417 5.34163 18.3417 6.39163V11.525C18.3417 13.3416 17.1834 15.175 15.5751 16L11.9417 17.8666C11.3417 18.175 10.6751 18.3333 10.0001 18.3333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectRequestValidationStep({
  open,
  onClose,
  onPrevious,
  onNext,
  code,
  isSubmitting = false,
  submitError = "",
  onCodeChange,
}) {
  return (
    <ProjectRequestModalShell
      open={open}
      sectionTitle="Validacion"
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={() => onNext?.(code)}
      nextDisabled={isSubmitting}
      nextLabel={isSubmitting ? "Enviando" : "Enviar"}
    >
      <div className="flex w-full flex-col gap-[8px]">
        <Input
          label="Codigo"
          required={false}
          showLabelInfo={false}
          showHint
          size="S"
          type="Default input"
          placeholder="Ingresa el codigo"
          hintText="Enviamos un codigo a tu correo"
          leftIcon={<SecurityIcon className="size-5" />}
          rightIcon={null}
          showLeftIcon
          showRightIcon={false}
          value={code}
          onChange={(event) => onCodeChange?.(event.target.value)}
          className="w-full max-w-none"
        />
        {submitError ? (
          <HintText state="Error" hintText={submitError} className="w-full" />
        ) : null}
      </div>
    </ProjectRequestModalShell>
  );
}

export default ProjectRequestValidationStep;
