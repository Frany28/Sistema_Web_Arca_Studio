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
  const [submitError, setSubmitError] = useState("");
  const [referenceFiles, setReferenceFiles] = useState([]);
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
      setSubmitError("");
      setReferenceFiles([]);
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

  const updateReferenceFile = (fileId, nextValues) => {
    setReferenceFiles((current) =>
      current.map((fileItem) =>
        fileItem.id === fileId
          ? {
              ...fileItem,
              ...nextValues,
            }
          : fileItem,
      ),
    );
  };

  const saveProjectRequest = async ({ prepare = false } = {}) => {
    const payload = {
      ...formValues,
      prepare,
    };
    const projectRequestId = formValues.projectRequestId ?? null;
    const data = projectRequestId
      ? await api.projectRequests.update({
          payload,
          projectRequestId,
        })
      : await api.projectRequests.create(payload);
    const nextProjectRequestId = data.projectRequest?.id ?? projectRequestId;

    setFormValues((current) => ({
      ...current,
      projectRequestId: nextProjectRequestId,
    }));

    return nextProjectRequestId;
  };

  const uploadReferenceFile = async (fileItem, projectRequestId) => {
    updateReferenceFile(fileItem.id, {
      errorMessage: "",
      loadedBytes: 0,
      progress: 0,
      status: "uploading",
    });

    try {
      const uploadResult = await api.projectRequests.uploadFile({
        file: fileItem.file,
        onUploadProgress: ({ loaded, progress, total }) => {
          updateReferenceFile(fileItem.id, {
            loadedBytes: loaded,
            progress,
            totalBytes: total,
          });
        },
        projectRequestId,
      });

      updateReferenceFile(fileItem.id, {
        loadedBytes: fileItem.file?.size || fileItem.totalBytes || 0,
        progress: 100,
        status: "completed",
        uploadResult,
      });
    } catch (error) {
      updateReferenceFile(fileItem.id, {
        canUpload: true,
        errorMessage: error.message || "No se pudo subir el archivo",
        progress: 0,
        status: "failed",
      });
      setSubmitError(error.message || "No se pudo subir el archivo.");
    }
  };

  const handleDetailsNext = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await saveProjectRequest({ prepare: true });
      setStep("references");
    } catch (error) {
      setSubmitError(error.message || "No se pudo preparar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReferenceFilesChange = async (nextFiles) => {
    setSubmitError("");
    const currentFileIds = new Set(referenceFiles.map((fileItem) => fileItem.id));
    const addedFiles = nextFiles.filter(
      (fileItem) => !currentFileIds.has(fileItem.id),
    );

    setReferenceFiles(nextFiles);

    const filesToUpload = addedFiles.filter(
      (fileItem) => fileItem.canUpload !== false,
    );

    if (filesToUpload.length === 0) {
      return;
    }

    let projectRequestId = formValues.projectRequestId ?? null;

    try {
      if (!projectRequestId) {
        projectRequestId = await saveProjectRequest({ prepare: true });
      }

      for (const fileItem of filesToUpload) {
        uploadReferenceFile(fileItem, projectRequestId);
      }
    } catch (error) {
      setSubmitError(error.message || "No se pudo preparar la solicitud.");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (referenceFiles.some((fileItem) => fileItem.canUpload === false)) {
        setSubmitError("Elimina los archivos con errores antes de enviar.");
        setStep("references");
        return;
      }

      if (referenceFiles.some((fileItem) => fileItem.status === "failed")) {
        setSubmitError("Elimina los archivos con errores antes de enviar.");
        setStep("references");
        return;
      }

      if (
        referenceFiles.some((fileItem) =>
          ["pending", "uploading"].includes(fileItem.status),
        )
      ) {
        setSubmitError("Espera a que los archivos terminen de subir.");
        setStep("references");
        return;
      }

      await saveProjectRequest({ prepare: false });
      setStep("success");
    } catch (error) {
      setSubmitError(error.message || "No se pudo enviar la solicitud.");
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
        submitError={submitError}
        onCodeChange={(code) => {
          setSubmitError("");
          setFormValues((current) => ({
            ...current,
            code,
          }));
        }}
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
        uploadedFiles={referenceFiles}
        submitError={submitError}
        onFilesChange={handleReferenceFilesChange}
        onReferenceLinkChange={(referenceLink) => {
          setSubmitError("");
          setFormValues((current) => ({
            ...current,
            referenceLink,
          }));
        }}
      />
    );
  }

  return (
    <ProjectRequestDetailsStep
      open={open}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={handleDetailsNext}
      values={formValues}
      submitError={submitError}
      onProjectNameChange={(projectName) => {
        setSubmitError("");
        setFormValues((current) => ({
          ...current,
          projectName,
        }));
      }}
      onProjectLocationChange={(projectLocation) => {
        setSubmitError("");
        setFormValues((current) => ({
          ...current,
          projectLocation,
        }));
      }}
      onProjectLocationSelect={(location) => {
        setSubmitError("");
        setFormValues((current) => ({
          ...current,
          projectLocationFormattedAddress: location.formattedAddress,
          projectLocationLatitude: location.latitude,
          projectLocationLongitude: location.longitude,
          projectLocationPlaceId: location.placeId,
        }));
      }}
      onDescriptionChange={(description) => {
        setSubmitError("");
        setFormValues((current) => ({
          ...current,
          description,
        }));
      }}
      onHasBlueprintsChange={(hasBlueprints) => {
        setSubmitError("");
        setFormValues((current) => ({
          ...current,
          hasBlueprints,
        }));
      }}
      onProjectTypeChange={(selectedProjectTypeId) => {
        setSubmitError("");
        setFormValues((current) => ({
          ...current,
          selectedProjectTypeId,
        }));
      }}
    />
  );
}

export default ProjectRequestModal;
