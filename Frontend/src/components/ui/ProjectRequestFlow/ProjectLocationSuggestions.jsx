function ProjectLocationSuggestions({ suggestions = [], onSelect }) {
  if (!suggestions.length) {
    return null;
  }

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mt-[6px] overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[var(--shadow-e2)]"
      role="listbox"
    >
      {suggestions.map((suggestion) => (
        <button
          key={`${suggestion.placeId ?? suggestion.formattedAddress}-${suggestion.latitude}-${suggestion.longitude}`}
          type="button"
          className="text-body-3 flex w-full cursor-pointer items-start px-[12px] py-[10px] text-left text-[var(--color-text-300)] transition-colors hover:bg-[var(--color-neutral-200)]"
          role="option"
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect?.(suggestion);
          }}
        >
          {suggestion.formattedAddress}
        </button>
      ))}
    </div>
  );
}

export default ProjectLocationSuggestions;
