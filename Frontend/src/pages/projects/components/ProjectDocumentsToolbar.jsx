import Button from "../../../components/ui/Button/Button.jsx";

function SearchIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9.583 17.5C13.955 17.5 17.5 13.955 17.5 9.583C17.5 5.211 13.955 1.667 9.583 1.667C5.211 1.667 1.667 5.211 1.667 9.583C1.667 13.955 5.211 17.5 9.583 17.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.333 18.333L16.667 16.667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowSwapIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.5 4.167L4.167 7.5L0.833 4.167"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(1.667 1.667)"
      />
      <path
        d="M5.833 2.5V15.833"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 15.833L15.833 12.5L19.167 15.833"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-0.833 -1.667)"
      />
      <path
        d="M14.167 17.5V4.167"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProjectDocumentsToolbar() {
  return (
    <div className="flex w-full items-start justify-center gap-[12px] border-b border-[var(--color-neutral-200)] pb-[16px]">
      <label className="flex min-w-0 flex-1 items-center overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[12px] py-[8px]">
        <SearchIcon className="mr-[8px] size-5 shrink-0 text-[var(--color-text-100)]" />
        <input
          type="search"
          placeholder="Buscar..."
          className="min-w-0 flex-1 border-0 bg-transparent text-body-3 text-[var(--color-text-300)] outline-none placeholder:text-[var(--color-text-100)]"
        />
      </label>

      <Button
        theme="Primary"
        type="Outline"
        size="S"
        showText={false}
        showLeftIcon
        showRightIcon={false}
        iconLeft={<ArrowSwapIcon className="size-5" />}
        aria-label="Ordenar documentos"
        className="shrink-0"
      />
    </div>
  );
}
