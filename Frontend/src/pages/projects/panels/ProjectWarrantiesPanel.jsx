import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowDown2, ArrowUp2, Filter, SearchNormal1 } from "iconsax-react";

import Badge from "../../../components/ui/Badge/Badge.jsx";
import {
  PROJECT_WARRANTIES,
  PROJECT_WARRANTY_FILTER_ITEMS,
} from "../projectWarrantyData.js";

function WarrantyChevronIcon({ expanded }) {
  const Icon = expanded ? ArrowUp2 : ArrowDown2;

  return (
    <Icon
      size={20}
      variant="Linear"
      color="currentColor"
      aria-hidden="true"
    />
  );
}

function FilterIcon() {
  return (
    <Filter
      size={20}
      variant="Linear"
      color="currentColor"
      aria-hidden="true"
    />
  );
}

function SearchIcon() {
  return (
    <SearchNormal1
      size={20}
      variant="Linear"
      color="currentColor"
      aria-hidden="true"
    />
  );
}

function WarrantySearchInput({ value, onChange }) {
  return (
    <label className="flex h-[40px] w-full max-w-[320px] shrink-0 items-center rounded-[12px] border border-[var(--color-neutral-200)] bg-transparent px-[8px] py-[2px] text-[var(--color-text-100)] transition-colors focus-within:border-[var(--color-neutral-300)]">
      <span className="flex h-[36px] min-w-0 flex-1 items-center gap-[8px] rounded-[var(--radius-2)] p-[8px]">
        <span className="inline-flex size-5 shrink-0 items-center justify-center">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={value}
          placeholder="Buscar..."
          className="min-w-0 flex-1 border-0 bg-transparent text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)] outline-none placeholder:text-[var(--color-text-100)]"
          onChange={onChange}
          aria-label="Buscar garantias"
        />
      </span>
    </label>
  );
}

function WarrantyFilterMenu({
  filters,
  selectedFilterId,
  selectedFilter,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative w-full max-w-[320px] shrink-0">
      <button
        type="button"
        className={clsx(
          "flex h-[40px] w-full cursor-pointer flex-col items-start rounded-[12px] border border-[var(--color-neutral-200)] bg-transparent px-[8px] py-[2px] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)]",
          open && "rounded-b-none",
        )}
        aria-label={`Filtrar garantias${selectedFilter ? `: ${selectedFilter.label}` : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex h-[36px] w-full items-center gap-[8px] rounded-[var(--radius-2)] p-[8px]">
          <span className="flex min-w-0 flex-1 items-center gap-[12px]">
            <span className="inline-flex size-5 shrink-0 items-center justify-center text-[var(--color-text-100)]">
              <FilterIcon />
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)]">
              Filtrar por:
            </span>
          </span>
          <span className="inline-flex size-5 shrink-0 items-center justify-center text-[var(--color-text-100)]">
            <ArrowDown2
              size={20}
              variant="Linear"
              color="currentColor"
              aria-hidden="true"
            />
          </span>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 flex w-full flex-col gap-[4px] rounded-b-[12px] border border-t-0 border-[var(--color-neutral-200)] bg-transparent px-[8px] pb-[8px] pt-[6px]"
        >
          {filters.map((item) => {
            const selected = item.id === selectedFilterId;

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={clsx(
                  "h-[36px] rounded-[var(--radius-2)] px-[8px] text-left text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)] transition-colors hover:bg-[var(--color-neutral-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)]",
                  selected && "bg-[var(--color-neutral-200)] text-[var(--color-text-300)]",
                )}
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function WarrantyDateBadge({ children }) {
  return (
    <span className="inline-flex h-[20px] items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-primary-100)] bg-[var(--color-neutral-100)] px-[8px] py-[2px] text-[12px] font-normal leading-[14px] tracking-[-0.5px] text-[var(--color-text-300)]">
      {children}
    </span>
  );
}

function WarrantyField({ children, className }) {
  return (
    <span
      className={clsx(
        "min-w-0 flex-1 truncate text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function WarrantyRow({ warranty, expanded, onToggle }) {
  const detailsId = `${warranty.id}-warranty-details`;

  return (
    <article className="flex w-full flex-col">
      <div className="grid min-h-[56px] grid-cols-[minmax(160px,1fr)_minmax(100px,1fr)_minmax(140px,1fr)_minmax(170px,1fr)_auto_auto] items-center gap-[20px] border-b border-[var(--color-neutral-200)] py-[12px] max-lg:grid-cols-[minmax(150px,1.2fr)_minmax(90px,0.8fr)_minmax(140px,1fr)_auto_auto] max-md:grid-cols-[minmax(0,1fr)_auto]">
        <WarrantyField>{warranty.item}</WarrantyField>
        <WarrantyField className="max-md:hidden">{warranty.code}</WarrantyField>
        <WarrantyField className="max-lg:hidden">{warranty.serial}</WarrantyField>
        <WarrantyField className="max-md:hidden">{warranty.period}</WarrantyField>

        <Badge
          label={warranty.status}
          theme={warranty.statusTheme}
          size="S"
          variation="Simple"
          className="justify-self-end"
        />

        <button
          type="button"
          className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-2)] text-[var(--color-text-200)] transition-colors hover:bg-[var(--color-neutral-10)] hover:text-[var(--color-text-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)]"
          aria-label={expanded ? "Contraer garantia" : "Expandir garantia"}
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggle}
        >
          <WarrantyChevronIcon expanded={expanded} />
        </button>
      </div>

      {expanded ? (
        <div id={detailsId} className="flex w-full flex-col">
          {warranty.details.map((detail) => (
            <div
              key={`${warranty.id}-${detail.label}`}
              className="flex min-h-[44px] items-center justify-between gap-[20px] border-b border-[var(--color-neutral-200)] px-[56px] py-[12px] max-md:px-[16px]"
            >
              <span className="w-[262px] max-w-full text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)]">
                {detail.label}
              </span>
              <WarrantyDateBadge>{detail.value}</WarrantyDateBadge>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function ProjectWarrantiesPanel({
  warranties = PROJECT_WARRANTIES,
  filters = PROJECT_WARRANTY_FILTER_ITEMS,
}) {
  const [query, setQuery] = useState("");
  const [selectedFilterId, setSelectedFilterId] = useState(filters[0]?.id);
  const [expandedIds, setExpandedIds] = useState(() => {
    return new Set(
      warranties
        .filter((warranty) => warranty.defaultExpanded)
        .map((warranty) => warranty.id),
    );
  });

  const selectedFilter = filters.find((item) => item.id === selectedFilterId);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesQuery = [
        warranty.item,
        warranty.code,
        warranty.serial,
        warranty.period,
        warranty.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

      const matchesFilter =
        selectedFilterId === "all" ||
        (selectedFilterId === "active" && warranty.status === "Activa") ||
        (selectedFilterId === "maintenance" && warranty.details?.length > 0) ||
        selectedFilterId === warranty.status?.toLowerCase();

      return matchesQuery && matchesFilter;
    });
  }, [normalizedQuery, selectedFilterId, warranties]);

  function toggleWarranty(warrantyId) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(warrantyId)) {
        next.delete(warrantyId);
      } else {
        next.add(warrantyId);
      }

      return next;
    });
  }

  return (
    <section className="flex w-full flex-col gap-[24px]" aria-label="Garantias">
      <div className="flex w-full flex-wrap items-start gap-[8px]">
        <WarrantySearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <WarrantyFilterMenu
          filters={filters}
          selectedFilterId={selectedFilterId}
          selectedFilter={selectedFilter}
          onSelect={setSelectedFilterId}
        />
      </div>

      <div className="flex w-full flex-col">
        {visibleWarranties.map((warranty) => (
          <WarrantyRow
            key={warranty.id}
            warranty={warranty}
            expanded={expandedIds.has(warranty.id)}
            onToggle={() => toggleWarranty(warranty.id)}
          />
        ))}

        {visibleWarranties.length === 0 ? (
          <div className="border-b border-[var(--color-neutral-200)] py-[24px] text-center text-body-3 text-[var(--color-text-100)]">
            No hay garantias que coincidan con la busqueda.
          </div>
        ) : null}
      </div>
    </section>
  );
}
