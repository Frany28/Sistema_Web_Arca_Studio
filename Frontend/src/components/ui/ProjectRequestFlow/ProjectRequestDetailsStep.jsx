import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Checkbox from "../Checkbox.jsx";
import DropdownMenu from "../DropdownMenu/DropdownMenu.jsx";
import HintText from "../HintText/HintText.jsx";
import Input from "../Input/Input.jsx";
import Label from "../Label/Label.jsx";
import ScrollBar from "../ScrollBar/ScrollBar.jsx";
import TextArea from "../TextArea/TextArea.jsx";
import ProjectLocationSuggestions from "./ProjectLocationSuggestions.jsx";
import ProjectRequestModalShell from "./ProjectRequestModalShell.jsx";
import { searchAddressSuggestions } from "../../../utils/geoapify.js";

const PROJECT_TYPE_OPTIONS = [
  { id: "residencial", label: "Residencial", type: "Checkbox", checked: "Yes" },
  { id: "comercial", label: "Comercial", type: "Checkbox", checked: "No" },
  { id: "corporativo", label: "Corporativo", type: "Checkbox", checked: "No" },
  {
    id: "stands",
    label: "Stands y exhibiciones",
    type: "Checkbox",
    checked: "No",
  },
];
function EditIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.05 3.00012L4.49169 9.94179C4.24169 10.2085 4.00002 10.7335 3.95002 11.1001L3.64169 13.7418C3.53335 14.6918 4.21669 15.3418 5.15835 15.1751L7.78335 14.7251C8.15002 14.6585 8.66669 14.3918 8.92502 14.1085L15.4834 7.16679C16.6167 5.96679 17.125 4.60012 15.3584 2.93346C13.6 1.28346 12.2667 1.86679 11.05 3.00012Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.95825 4.15845C10.2999 6.35012 12.0749 8.01679 14.2833 8.23345"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.33325 18.3334H16.6666"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.0001 11.1917C11.4375 11.1917 12.6026 10.0266 12.6026 8.58924C12.6026 7.15188 11.4375 5.98676 10.0001 5.98676C8.56275 5.98676 7.39764 7.15188 7.39764 8.58924C7.39764 10.0266 8.56275 11.1917 10.0001 11.1917Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.01672 7.07508C4.65839 -0.141585 15.3501 -0.133252 16.9834 7.08342C17.9417 11.3168 15.3084 14.9001 13.0001 17.1168C11.3251 18.7334 8.67506 18.7334 6.99172 17.1168C4.69172 14.9001 2.05839 11.3084 3.01672 7.07508Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ProjectRequestDetailsStep({
  open,
  onClose,
  onPrevious,
  onNext,
  values,
  onProjectNameChange,
  onProjectLocationChange,
  onDescriptionChange,
  onHasBlueprintsChange,
  onProjectTypeChange,
  onProjectLocationSelect,
}) {
  const modalBodyMaxHeight = 520;
  const [isProjectTypeMenuOpen, setIsProjectTypeMenuOpen] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollLength, setScrollLength] = useState(1);
  const [contentHeight, setContentHeight] = useState(modalBodyMaxHeight);
  const [isLocationInputFocused, setIsLocationInputFocused] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const contentRef = useRef(null);
  const isProjectNameValid = values.projectName.trim().length > 0;
  const isProjectTypeValid = Boolean(values.selectedProjectTypeId);
  const isProjectLocationValid = values.projectLocation.trim().length > 0;
  const isBlueprintsValid =
    values.hasBlueprints === "Yes" || values.hasBlueprints === "No";
  const showProjectNameError = hasAttemptedSubmit && !isProjectNameValid;
  const showProjectTypeError = hasAttemptedSubmit && !isProjectTypeValid;
  const showProjectLocationError =
    hasAttemptedSubmit && !isProjectLocationValid;
  const showBlueprintsError = hasAttemptedSubmit && !isBlueprintsValid;

  const projectTypeItems = useMemo(
    () =>
      PROJECT_TYPE_OPTIONS.map((option) => ({
        ...option,
        checked: option.id === values.selectedProjectTypeId ? "Yes" : "No",
      })),
    [values.selectedProjectTypeId],
  );

  const selectedProjectType = useMemo(
    () =>
      projectTypeItems.find(
        (option) => option.id === values.selectedProjectTypeId,
      ) ?? null,
    [projectTypeItems, values.selectedProjectTypeId],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setIsProjectTypeMenuOpen(false);
      setHasAttemptedSubmit(false);
      setScrollPosition(0);
      setScrollLength(1);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (
      !open ||
      values.projectLocation.trim().length < 2 ||
      values.projectLocationLatitude
    ) {
      setLocationSuggestions([]);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      searchAddressSuggestions(values.projectLocation, {
        signal: controller.signal,
      })
        .then(setLocationSuggestions)
        .catch((error) => {
          if (error.name !== "AbortError") {
            setLocationSuggestions([]);
          }
        });
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [open, values.projectLocation, values.projectLocationLatitude]);

  useEffect(() => {
    const container = contentRef.current;

    if (!open || !container) {
      return undefined;
    }

    function syncScrollMetrics() {
      const maxScroll = Math.max(
        container.scrollHeight - container.clientHeight,
        1,
      );
      const nextLength = Math.min(
        container.clientHeight / Math.max(container.scrollHeight, 1),
        1,
      );
      setContentHeight(container.clientHeight);
      setScrollLength(nextLength);
      setScrollPosition(container.scrollTop / maxScroll);
    }

    syncScrollMetrics();
    window.addEventListener("resize", syncScrollMetrics);

    return () => {
      window.removeEventListener("resize", syncScrollMetrics);
    };
  }, [
    values.description,
    values.hasBlueprints,
    isProjectTypeMenuOpen,
    open,
    values.projectLocation,
    values.projectName,
    values.selectedProjectTypeId,
  ]);

  useEffect(() => {
    const container = contentRef.current;

    if (!container) {
      return;
    }

    const maxScroll = Math.max(
      container.scrollHeight - container.clientHeight,
      0,
    );
    container.scrollTo({
      top: maxScroll * scrollPosition,
      behavior: "auto",
    });
  }, [scrollPosition]);

  const handleNext = () => {
    setHasAttemptedSubmit(true);

    if (
      !isProjectNameValid ||
      !isProjectTypeValid ||
      !isProjectLocationValid ||
      !isBlueprintsValid
    ) {
      return;
    }

    onNext?.();
  };

  const handleLocationSuggestionSelect = (suggestion) => {
    setHasAttemptedSubmit(false);
    setLocationSuggestions([]);
    setIsLocationInputFocused(false);
    onProjectLocationChange?.(suggestion.formattedAddress);
    onProjectLocationSelect?.(suggestion);
  };

  return (
    <ProjectRequestModalShell
      open={open}
      sectionTitle="Detalles del proyecto"
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={handleNext}
      nextLabel="Siguiente"
    >
      <div className="flex items-start pr-[4px]">
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ maxHeight: `${modalBodyMaxHeight}px` }}
          onScroll={(event) => {
            const { scrollTop, scrollHeight, clientHeight } =
              event.currentTarget;
            const maxScroll = Math.max(scrollHeight - clientHeight, 1);
            setScrollPosition(scrollTop / maxScroll);
          }}
        >
          <div className="flex w-full flex-col gap-[16px]">
            <Input
              label="Nombre del proyecto"
              required
              showLabelInfo={false}
              showHint={false}
              size="S"
              type="Default input"
              state={showProjectNameError ? "Error" : "Default"}
              placeholder='Ej. "Apto. Noventa y Uno"'
              leftIcon={<EditIcon className="size-5" />}
              rightIcon={null}
              showLeftIcon
              showRightIcon={false}
              value={values.projectName}
              onChange={(event) => {
                setHasAttemptedSubmit(false);
                onProjectNameChange?.(event.target.value);
              }}
              className="w-full max-w-none"
            />
            {showProjectNameError ? (
              <HintText
                state="Error"
                hintText="Ingresa el nombre del proyecto"
                className="w-full"
              />
            ) : null}

            <div className="flex w-full flex-col gap-[8px]">
              <Label label="Tipo de proyecto" required information={false} />
              <DropdownMenu
                type="Text"
                label={
                  selectedProjectType?.label ?? "Selecciona tipo de proyecto"
                }
                supportingText=""
                items={projectTypeItems}
                selectedItemId={selectedProjectType?.id}
                open={isProjectTypeMenuOpen}
                onOpenChange={setIsProjectTypeMenuOpen}
                showDivider={isProjectTypeMenuOpen}
                onItemSelect={(item) => {
                  setHasAttemptedSubmit(false);
                  onProjectTypeChange?.(item.id);
                  setIsProjectTypeMenuOpen(false);
                }}
                interactive
                className={clsx(
                  "w-full",
                  showProjectTypeError && "border-[var(--color-danger-100)]",
                )}
                aria-label="Seleccionar tipo de proyecto"
              />
              {showProjectTypeError ? (
                <HintText
                  state="Error"
                  hintText="Selecciona un tipo de proyecto"
                  className="w-full"
                />
              ) : null}
            </div>

            <div className="relative">
              <Input
                label="Ubicación del proyecto"
                required
                showLabelInfo={false}
                showHint={false}
                size="S"
                type="Default input"
                state={showProjectLocationError ? "Error" : "Default"}
                placeholder='Ej. "Maracaibo, Estado Zulia."'
                leftIcon={<LocationIcon className="size-5" />}
                rightIcon={null}
                showLeftIcon
                showRightIcon={false}
                value={values.projectLocation}
                onFocus={() => setIsLocationInputFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => {
                    setIsLocationInputFocused(false);
                  }, 120);
                }}
                onChange={(event) => {
                  setHasAttemptedSubmit(false);
                  setIsLocationInputFocused(true);
                  onProjectLocationChange?.(event.target.value);
                  onProjectLocationSelect?.({
                    formattedAddress: "",
                    latitude: null,
                    longitude: null,
                    placeId: null,
                  });
                }}
                className="w-full max-w-none"
              />
              {isLocationInputFocused && locationSuggestions.length ? (
                <ProjectLocationSuggestions
                  suggestions={locationSuggestions}
                  onSelect={handleLocationSuggestionSelect}
                />
              ) : null}
            </div>
            {values.projectLocationLatitude ? (
              <HintText
                state="Success"
                hintText={`Coordenadas: ${Number(
                  values.projectLocationLatitude,
                ).toFixed(6)}, ${Number(
                  values.projectLocationLongitude,
                ).toFixed(6)}`}
                className="w-full"
              />
            ) : null}
            {showProjectLocationError ? (
              <HintText
                state="Error"
                hintText="Ingresa la ubicación del proyecto"
                className="w-full"
              />
            ) : null}

            <TextArea
              label="Descripción"
              required={false}
              showLabelInfo
              showHint
              placeholder="Texto de prueba"
              value={values.description}
              onChange={(event) => onDescriptionChange?.(event.target.value)}
              rows={5}
              minHeight={130}
              className="w-full max-w-none"
            />

            <div className="flex w-full items-center justify-between border-t border-[var(--color-neutral-200)] py-[12px]">
              <Label
                label="¿Dispone de planos del lugar?"
                required
                information={false}
                className="min-w-0"
              />
              <Checkbox
                size="S"
                checked={values.hasBlueprints}
                interactive
                onCheckedChange={(nextValue) => {
                  setHasAttemptedSubmit(false);
                  onHasBlueprintsChange?.(nextValue);
                }}
                className="shrink-0"
              />
            </div>
            {showBlueprintsError ? (
              <HintText
                state="Error"
                hintText="Indica si dispones de planos del lugar"
                className="w-full"
              />
            ) : null}
          </div>
        </div>

        {scrollLength < 1 ? (
          <ScrollBar
            height={Math.max(
              Math.min(contentHeight, modalBodyMaxHeight),
              24,
            )}
            length={scrollLength}
            position={scrollPosition}
            interactive
            onPositionChange={setScrollPosition}
            className="shrink-0"
          />
        ) : null}
      </div>
    </ProjectRequestModalShell>
  );
}

export default ProjectRequestDetailsStep;
