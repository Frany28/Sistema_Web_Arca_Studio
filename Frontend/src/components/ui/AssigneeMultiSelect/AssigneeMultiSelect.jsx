import { useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import Input from "../Input/Input.jsx";
import { getAvatarPresentation } from "../../../utils/avatarPresentation.js";
import AssigneeRemovalModal from "./AssigneeRemovalModal.jsx";
import { getRemovedAssignees } from "./assigneeSelection.js";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function toTag(person, showAvatar) {
  const avatar = getAvatarPresentation({
    identity: person.id,
    name: person.name,
    roleCode: person.roleCode,
    src: showAvatar
      ? person.profilePhotoUrl || person.avatarUrl || person.photo || ""
      : "",
  });

  return {
    id: String(person.id),
    label: person.name,
    avatar: showAvatar,
    avatarText: avatar.initials || getInitials(person.name) || "E",
    avatarSrc: showAvatar ? avatar.src : "",
    avatarTheme: avatar.theme,
    avatarContent: avatar.content,
    closeIcon: true,
  };
}

function AssigneeMultiSelect({
  "aria-label": ariaLabel = "Seleccionar responsables",
  className,
  confirmRemoval = false,
  contextName = "",
  disabled = false,
  error = "",
  loading = false,
  onChange,
  onRemovalSuccess,
  options = [],
  placeholder = "Asignar responsables...",
  showTagAvatars = true,
  value = [],
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [localError, setLocalError] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState(null);

  const selectedIds = useMemo(
    () => new Set(value.map((person) => String(person.id))),
    [value],
  );
  const visibleOptions = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());

    return options.filter((person) => {
      const searchableText = normalizeText(
        `${person.name || ""} ${person.roleName || ""}`,
      );

      return !normalizedQuery || searchableText.includes(normalizedQuery);
    });
  }, [options, query]);
  const peopleById = useMemo(
    () =>
      new Map(
        [...value, ...options].map((person) => [String(person.id), person]),
      ),
    [options, value],
  );
  const selectedTags = useMemo(
    () =>
      value.map((person) =>
        toTag(
          { ...peopleById.get(String(person.id)), ...person },
          showTagAvatars,
        ),
      ),
    [peopleById, showTagAvatars, value],
  );
  const optionTags = useMemo(
    () => visibleOptions.map((person) => toTag(person, showTagAvatars)),
    [showTagAvatars, visibleOptions],
  );
  const isDisabled = disabled || loading || isSaving;
  const resolvedError = localError || error;

  const commit = async (nextValue, removedAssignees = []) => {
    if (!onChange || isDisabled) return;

    setIsSaving(true);
    setLocalError("");
    try {
      await onChange(nextValue);
      setQuery("");
      if (removedAssignees.length) {
        onRemovalSuccess?.(removedAssignees);
      }
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (changeError) {
      setLocalError(
        changeError?.message || "No se pudieron guardar los responsables.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const requestChange = (nextValue) => {
    const removedAssignees = getRemovedAssignees(value, nextValue);

    if (confirmRemoval && removedAssignees.length) {
      setPendingRemoval({ nextValue, removedAssignees });
      return;
    }

    void commit(nextValue);
  };

  const handleTagsChange = (nextTags) => {
    const nextValue = nextTags
      .map((tag) => peopleById.get(String(tag.id)))
      .filter(Boolean);

    requestChange(nextValue);
  };

  const handleTagOptionSelect = (tag) => {
    const person = peopleById.get(String(tag.id));

    if (!person || selectedIds.has(String(person.id))) return;
    void commit([...value, person]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setQuery("");
      return;
    }

    if (event.key === "Enter" && visibleOptions.length) {
      const firstAvailablePerson = visibleOptions.find(
        (person) => !selectedIds.has(String(person.id)),
      );

      if (firstAvailablePerson) {
        event.preventDefault();
        void commit([...value, firstAvailablePerson]);
      }
      return;
    }

    if (event.key === "Backspace" && !query && value.length) {
      event.preventDefault();
      requestChange(value.slice(0, -1));
    }
  };

  const removedNames = pendingRemoval?.removedAssignees
    ?.map((assignee) => assignee.name)
    .filter(Boolean)
    .join(", ");

  const handleConfirmRemoval = () => {
    const removal = pendingRemoval;

    setPendingRemoval(null);
    if (removal) {
      void commit(removal.nextValue, removal.removedAssignees);
    }
  };

  return (
    <>
      <div
        className={clsx("min-w-0", className)}
        onClick={() => {
          if (!isDisabled) inputRef.current?.focus();
        }}
      >
        <Input
          id={inputId}
          inputRef={inputRef}
          type="Tags"
          size="S"
          state={resolvedError ? "Error" : "Default"}
          value={query}
          tags={selectedTags}
          tagOptions={optionTags}
          tagGroupAriaLabel={`${ariaLabel}: empleados disponibles y seleccionados`}
          tagGroupPlacement="overlay"
          showTagOptionsOnFocus
          onTagOptionSelect={handleTagOptionSelect}
          showLabel={false}
          showHint={Boolean(resolvedError)}
          hintText={resolvedError}
          showLabelInfo={false}
          showLeftIcon
          showRightIcon={isSaving}
          rightIcon={
            isSaving ? (
              <span
                className="size-4 animate-spin rounded-full border-2 border-[var(--color-neutral-300)] border-t-[var(--color-primary-300)]"
                aria-hidden="true"
              />
            ) : null
          }
          rightIconAriaLabel="Guardando responsables"
          required={false}
          disabled={isDisabled}
          placeholder={loading ? "Cargando empleados..." : placeholder}
          className="max-w-none"
          inputClassName="[&::-webkit-search-cancel-button]:hidden"
          aria-label={ariaLabel}
          aria-invalid={Boolean(resolvedError)}
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onTagsChange={handleTagsChange}
        />
      </div>

      <AssigneeRemovalModal
        open={Boolean(pendingRemoval)}
        assigneeName={removedNames}
        projectName={contextName}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={handleConfirmRemoval}
      />
    </>
  );
}

export default AssigneeMultiSelect;
