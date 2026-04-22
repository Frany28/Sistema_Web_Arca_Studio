import { useEffect, useState } from "react";
import ProjectRequestDetailsStep from "./ProjectRequestFlow/ProjectRequestDetailsStep.jsx";
import ProjectRequestReferencesStep from "./ProjectRequestFlow/ProjectRequestReferencesStep.jsx";
import ProjectRequestSuccessStep from "./ProjectRequestFlow/ProjectRequestSuccessStep.jsx";
import ProjectRequestValidationStep from "./ProjectRequestFlow/ProjectRequestValidationStep.jsx";

function ProjectRequestModal({
  open,
  onClose,
  onPrevious,
  onNext,
}) {
  const [step, setStep] = useState("details");
  const [formValues, setFormValues] = useState({
    projectName: "",
    projectLocation: "",
    description: "",
    hasBlueprints: "No",
    selectedProjectTypeId: "",
    referenceLink: "",
    code: "",
  });

  useEffect(() => {
    if (!open) {
      setStep("details");
      setFormValues({
        projectName: "",
        projectLocation: "",
        description: "",
        hasBlueprints: "No",
        selectedProjectTypeId: "",
        referenceLink: "",
        code: "",
      });
    }
  }, [open]);

  if (step === "success") {
    return (
      <ProjectRequestSuccessStep
        open={open}
        onClose={onClose}
        onAccept={() => {
          onNext?.(formValues);
          onClose?.();
        }}
      />
    );
  }

  if (step === "validation") {
    return (
      <ProjectRequestValidationStep
        open={open}
        onClose={onClose}
        onPrevious={() => setStep("references")}
        onNext={() => setStep("success")}
        code={formValues.code}
        onCodeChange={(code) =>
          setFormValues((current) => ({
            ...current,
            code,
          }))
        }
      />
    );
  }

  if (step === "references") {
    return (
      <ProjectRequestReferencesStep
        open={open}
        onClose={onClose}
        onPrevious={() => setStep("details")}
        onNext={() => setStep("validation")}
        values={formValues}
        onReferenceLinkChange={(referenceLink) =>
          setFormValues((current) => ({
            ...current,
            referenceLink,
          }))
        }
      />
    );
  }

  return (
    <ProjectRequestDetailsStep
      open={open}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={() => setStep("references")}
      values={formValues}
      onProjectNameChange={(projectName) =>
        setFormValues((current) => ({
          ...current,
          projectName,
        }))
      }
      onProjectLocationChange={(projectLocation) =>
        setFormValues((current) => ({
          ...current,
          projectLocation,
        }))
      }
      onDescriptionChange={(description) =>
        setFormValues((current) => ({
          ...current,
          description,
        }))
      }
      onHasBlueprintsChange={(hasBlueprints) =>
        setFormValues((current) => ({
          ...current,
          hasBlueprints,
        }))
      }
      onProjectTypeChange={(selectedProjectTypeId) =>
        setFormValues((current) => ({
          ...current,
          selectedProjectTypeId,
        }))
      }
    />
  );
}

export default ProjectRequestModal;
