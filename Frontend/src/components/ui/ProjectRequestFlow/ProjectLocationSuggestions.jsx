function ProjectLocationSuggestions({ suggestions = [], onSelect }) {
  if (!suggestions.length) {
    return null;
  }

  return (
    <div
      className="absolute left-0 top-full z-[2] flex w-full flex-col gap-[4px] rounded-b-[12px] border border-[var(--color-neutral-200)] border-t-0 bg-[var(--color-neutral-100)] p-[4px]"
      role="menu"
    >
      {suggestions.map((suggestion) => (
        <button
          key={`${suggestion.placeId ?? suggestion.formattedAddress}-${suggestion.latitude}-${suggestion.longitude}`}
          type="button"
          className="group flex h-[39px] w-full items-center gap-[8px] rounded-[8px] px-[8px] text-left transition-colors duration-150 hover:bg-[var(--color-neutral-200)] focus-visible:bg-[var(--color-neutral-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)]"
          role="menuitem"
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect?.(suggestion);
          }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-[12px]">
            <div className="flex min-w-0 flex-1 items-center gap-[8px] tracking-[-0.5px]">
              <p className="truncate text-heading-8 text-[var(--color-text-200)]">
                {suggestion.formattedAddress}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ProjectLocationSuggestions;
