import { useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import Input from "../Input/Input.jsx";

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
  return {
    id: String(person.id),
    label: person.name,
    avatar: showAvatar,
    avatarText: getInitials(person.name) || "E",
    closeIcon: true,
  };
}

function AssigneeMultiSelect({
  "aria-label": ariaLabel = "Seleccionar responsables",
  className,
  disabled = false,
  error = "",
  loading = false,
  onChange,
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
        [...options, ...value].map((person) => [String(person.id), person]),
      ),
    [options, value],
  );
  const selectedTags = useMemo(
    () => value.map((person) => toTag(person, showTagAvatars)),
    [showTagAvatars, value],
  );
  const optionTags = useMemo(
    () => visibleOptions.map((person) => toTag(person, showTagAvatars)),
    [showTagAvatars, visibleOptions],
  );
  const isDisabled = disabled || loading || isSaving;
  const resolvedError = localError || error;

  const commit = async (nextValue) => {
    if (!onChange || isDisabled) return;

    setIsSaving(true);
    setLocalError("");
    try {
      await onChange(nextValue);
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (changeError) {
      setLocalError(
        changeError?.message || "No se pudieron guardar los responsables.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagsChange = (nextTags) => {
    const nextValue = nextTags
      .map((tag) => peopleById.get(String(tag.id)))
      .filter(Boolean);

    void commit(nextValue);
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
      void commit(value.slice(0, -1));
    }
  };

  return (
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
  );
}

export default AssigneeMultiSelect;
