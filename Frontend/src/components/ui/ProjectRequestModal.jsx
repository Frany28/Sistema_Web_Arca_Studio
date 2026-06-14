import { useEffect, useState } from "react";
import { api } from "../../api/http.js";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    projectName: "",
    projectLocation: "",
    projectLocationFormattedAddress: "",
    projectLocationLatitude: null,
    projectLocationLongitude: null,
    projectLocationPlaceId: null,
    description: "",
    hasBlueprints: "No",
    selectedProjectTypeId: "",
    referenceLink: "",
    code: "",
  });

  useEffect(() => {
    if (!open) {
      setStep("details");
      setIsSubmitting(false);
      setFormValues({
        projectName: "",
        projectLocation: "",
        projectLocationFormattedAddress: "",
        projectLocationLatitude: null,
        projectLocationLongitude: null,
        projectLocationPlaceId: null,
        description: "",
        hasBlueprints: "No",
        selectedProjectTypeId: "",
        referenceLink: "",
        code: "",
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const data = await api.projectRequests.create(formValues);
      setFormValues((current) => ({
        ...current,
        projectRequestId: data.projectRequest?.id ?? null,
      }));
      setStep("success");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        onNext={handleSubmit}
        code={formValues.code}
        isSubmitting={isSubmitting}
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
      onProjectLocationSelect={(location) =>
        setFormValues((current) => ({
          ...current,
          projectLocationFormattedAddress: location.formattedAddress,
          projectLocationLatitude: location.latitude,
          projectLocationLongitude: location.longitude,
          projectLocationPlaceId: location.placeId,
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
