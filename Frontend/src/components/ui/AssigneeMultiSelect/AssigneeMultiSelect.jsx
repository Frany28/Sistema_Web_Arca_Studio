import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { TickCircle, User } from "iconsax-react";

import Tag from "../Tag/Tag.jsx";

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
  showTagAvatars = false,
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

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
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
    <div ref={rootRef} className={clsx("relative min-w-0", className)}>
      <div
        className={clsx(
          "flex h-9 w-full items-center gap-[8px] rounded-[var(--radius-2)] border bg-[var(--color-neutral-100)] px-[12px] py-[8px] shadow-none transition-[border-color,box-shadow]",
          resolvedError
            ? "border-[var(--color-danger-100)]"
            : "border-[var(--color-neutral-200)] focus-within:border-[var(--color-primary-300)] focus-within:shadow-[0_0_0_1px_var(--color-primary-10)]",
          isDisabled ? "cursor-not-allowed opacity-70" : "cursor-text",
        )}
        onClick={() => {
          if (!isDisabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <User
          size="20"
          variant="Linear"
          color="currentColor"
          className="shrink-0 text-[var(--color-neutral-400)]"
          aria-hidden="true"
        />

        <div className="flex min-w-0 flex-1 items-center gap-[4px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {value.map((person) => (
            <Tag
              key={person.id}
              label={person.name}
              size="S"
              avatar={showTagAvatars}
              avatarText={getInitials(person.name) || "E"}
              checkbox={false}
              closeIcon
              count={false}
              disabled={isDisabled}
              onRemove={() =>
                void commit(
                  value.filter(
                    (selected) => String(selected.id) !== String(person.id),
                  ),
                )
              }
            />
          ))}

          <input
            ref={inputRef}
            id={inputId}
            type="search"
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
            disabled={isDisabled}
            value={query}
            placeholder={value.length ? "" : loading ? "Cargando empleados..." : placeholder}
            className="text-body-3 min-w-[72px] flex-1 border-0 bg-transparent p-0 text-[var(--color-text-300)] outline-none placeholder:text-[var(--color-text-100)] [&::-webkit-search-cancel-button]:hidden"
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => !isDisabled && setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {isSaving ? (
          <span
            className="size-4 shrink-0 animate-spin rounded-full border-2 border-[var(--color-neutral-300)] border-t-[var(--color-primary-300)]"
            aria-label="Guardando responsables"
          />
        ) : null}
      </div>

      {isOpen && !isDisabled && menuPosition
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

      {resolvedError ? (
        <p className="text-body-4 mt-[4px] text-[var(--color-danger-100)]" role="alert">
          {resolvedError}
        </p>
      ) : null}
    </div>
  );
}

export default AssigneeMultiSelect;
