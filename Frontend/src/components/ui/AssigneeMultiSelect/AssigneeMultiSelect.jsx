import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { TickCircle } from "iconsax-react";

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
  const listboxId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [localError, setLocalError] = useState("");
  const [menuPosition, setMenuPosition] = useState(null);

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
  const isDisabled = disabled || loading || isSaving;
  const resolvedError = localError || error;
  const peopleById = useMemo(
    () =>
      new Map(
        [...options, ...value].map((person) => [String(person.id), person]),
      ),
    [options, value],
  );
  const selectedTags = useMemo(
    () =>
      value.map((person) => ({
        id: String(person.id),
        label: person.name,
        avatar: showTagAvatars,
        avatarText: getInitials(person.name) || "E",
        closeIcon: true,
      })),
    [showTagAvatars, value],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsidePointer = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    return () => document.removeEventListener("mousedown", closeOnOutsidePointer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const positionMenu = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      const width = Math.max(rect.width, 252);
      const viewportPadding = 8;
      const menuHeight = Math.min(224, visibleOptions.length * 40 + 8);
      const opensAbove =
        window.innerHeight - rect.bottom < menuHeight + viewportPadding &&
        rect.top > menuHeight;
      setMenuPosition({
        left: Math.min(
          Math.max(rect.left, viewportPadding),
          Math.max(window.innerWidth - width - viewportPadding, viewportPadding),
        ),
        top: opensAbove
          ? Math.max(viewportPadding, rect.top - menuHeight - 4)
          : rect.bottom + 4,
        width,
      });
    };

    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);

    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [isOpen, visibleOptions.length]);

  useEffect(() => {
    setActiveIndex((current) =>
      Math.min(current, Math.max(visibleOptions.length - 1, 0)),
    );
  }, [visibleOptions.length]);

  const commit = async (nextValue) => {
    if (!onChange || isDisabled) return;

    setIsSaving(true);
    setLocalError("");
    try {
      await onChange(nextValue);
      setQuery("");
      setIsOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (changeError) {
      setLocalError(
        changeError?.message || "No se pudieron guardar los responsables.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleOption = (person) => {
    const personId = String(person.id);
    const nextValue = selectedIds.has(personId)
      ? value.filter((selected) => String(selected.id) !== personId)
      : [...value, person];

    void commit(nextValue);
  };

  const handleTagsChange = (nextTags) => {
    const nextValue = nextTags
      .map((tag) => peopleById.get(String(tag.id)))
      .filter(Boolean);

    void commit(nextValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!query.trim()) {
        return;
      }

      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const optionCount = visibleOptions.length;
        return optionCount ? (current + direction + optionCount) % optionCount : 0;
      });
      return;
    }

    if (event.key === "Enter" && isOpen && visibleOptions[activeIndex]) {
      event.preventDefault();
      toggleOption(visibleOptions[activeIndex]);
      return;
    }

    if (event.key === "Backspace" && !query && value.length) {
      event.preventDefault();
      void commit(value.slice(0, -1));
    }
  };

  return (
    <div
      ref={rootRef}
      className={clsx("relative min-w-0", className)}
      onClick={() => {
        if (!isDisabled) {
          inputRef.current?.focus();
        }
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
        tagOptions={[]}
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
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-invalid={Boolean(resolvedError)}
        aria-activedescendant={
          isOpen && visibleOptions[activeIndex]
            ? `${listboxId}-${visibleOptions[activeIndex].id}`
            : undefined
        }
        autoComplete="off"
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          setIsOpen(Boolean(nextQuery.trim()));
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        onTagsChange={handleTagsChange}
      />

      {isOpen && query.trim() && !isDisabled && menuPosition
        ? createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="fixed z-[100] max-h-[224px] min-w-[252px] overflow-y-auto rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[4px] shadow-[0_8px_24px_rgba(27,28,29,0.12)]"
          style={menuPosition}
        >
          {visibleOptions.length ? (
            visibleOptions.map((person, index) => {
              const isSelected = selectedIds.has(String(person.id));

              return (
                <button
                  key={person.id}
                  id={`${listboxId}-${person.id}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={clsx(
                    "flex min-h-10 w-full items-center gap-[8px] rounded-[var(--radius-1)] px-[8px] py-[6px] text-left",
                    index === activeIndex || isSelected
                      ? "bg-[var(--color-neutral-200)]"
                      : "hover:bg-[var(--color-neutral-200)]",
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggleOption(person)}
                >
                  <span className="text-body-4 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-10)] text-[var(--color-primary-300)]">
                    {getInitials(person.name) || "E"}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-body-3 truncate text-[var(--color-text-300)]">
                      {person.name}
                    </span>
                    <span className="text-body-4 truncate text-[var(--color-text-100)]">
                      {person.roleName || "Empleado"}
                    </span>
                  </span>
                  {isSelected ? (
                    <TickCircle
                      size="18"
                      variant="Bold"
                      color="currentColor"
                      className="shrink-0 text-[var(--color-primary-300)]"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })
          ) : (
            <p className="text-body-4 px-[8px] py-[10px] text-[var(--color-text-100)]">
              No hay empleados que coincidan.
            </p>
          )}
        </div>,
        document.body,
      )
        : null}

    </div>
  );
}

export default AssigneeMultiSelect;
