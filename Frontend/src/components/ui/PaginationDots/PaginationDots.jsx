import clsx from "clsx";
import {
  PAGINATION_DOTS_ATOM_STYLES,
  PAGINATION_DOTS_DEFAULT_PROPS,
  PAGINATION_DOTS_TYPES,
} from "./paginationDotsConfig.js";

function clampIndex(index, count) {
  const normalizedCount = Math.max(count, 1);
  const numericIndex = Number.isFinite(index) ? Math.trunc(index) : 0;

  return Math.min(Math.max(numericIndex, 0), normalizedCount - 1);
}

function resolveAtomType(type, isActive) {
  if (type === "Both") {
    return isActive ? "Line" : "Dot";
  }

  return type;
}

function PaginationDots({
  className,
  count = PAGINATION_DOTS_DEFAULT_PROPS.count,
  activeIndex = PAGINATION_DOTS_DEFAULT_PROPS.activeIndex,
  type = PAGINATION_DOTS_DEFAULT_PROPS.type,
  interactive = PAGINATION_DOTS_DEFAULT_PROPS.interactive,
  onChange,
  ariaLabel = "Pagination dots",
  ...props
}) {
  const resolvedCount = Number.isFinite(count)
    ? Math.max(Math.trunc(count), 1)
    : PAGINATION_DOTS_DEFAULT_PROPS.count;
  const resolvedType = PAGINATION_DOTS_TYPES.includes(type)
    ? type
    : PAGINATION_DOTS_DEFAULT_PROPS.type;
  const resolvedActiveIndex = clampIndex(activeIndex, resolvedCount);
  const isInteractive = interactive || typeof onChange === "function";

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-[12px] rounded-full bg-[var(--color-neutral-bg)] p-[8px]",
        className,
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {Array.from({ length: resolvedCount }, (_, index) => {
        const isActive = index === resolvedActiveIndex;
        const atomType = resolveAtomType(resolvedType, isActive);
        const atom = (
          <span
            className={clsx(
              "block rounded-full transition-[width,background-color] duration-200",
              PAGINATION_DOTS_ATOM_STYLES[atomType],
              isActive
                ? "bg-[var(--color-text-300)]"
                : "bg-[var(--color-neutral-200)]",
            )}
            aria-hidden="true"
          />
        );

        if (!isInteractive) {
          return (
            <span
              key={`pagination-dot-${index}`}
              className="inline-flex items-center justify-center"
            >
              {atom}
            </span>
          );
        }

        return (
          <button
            key={`pagination-dot-${index}`}
            type="button"
            className="inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-bg)]"
            aria-label={`Ir al elemento ${index + 1}`}
            aria-pressed={isActive}
            onClick={() => onChange?.(index)}
          >
            {atom}
          </button>
        );
      })}
    </div>
  );
}

export default PaginationDots;
