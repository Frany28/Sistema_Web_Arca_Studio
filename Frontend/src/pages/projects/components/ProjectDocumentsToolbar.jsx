import Button from "../../../components/ui/Button/Button.jsx";
import Input from "../../../components/ui/Input/Input.jsx";

function ArrowSwapIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8.7083 5.59998L5.60828 2.5L2.5083 5.59998"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.60791 17.5V2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.2915 14.4004L14.3915 17.5004L17.4915 14.4004"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.3916 2.5V17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProjectDocumentsToolbar({ disabled = false }) {
  return (
    <div className="flex w-full items-start justify-center gap-[12px] border-b border-[var(--color-neutral-200)] pb-[16px]">
      <Input
        type="Search bar"
        size="S"
        showLabel={false}
        showHint={false}
        showRightIcon={false}
        required={false}
        placeholder="Buscar..."
        disabled={disabled}
        className="min-w-0 flex-1 gap-0"
        aria-label="Buscar documentos"
      />

      <Button
        theme="Primary"
        type="Outline"
        size="S"
        showText={false}
        showLeftIcon
        showRightIcon={false}
        iconLeft={<ArrowSwapIcon className="size-5" />}
        disabled={disabled}
        aria-label="Ordenar documentos"
        className="shrink-0"
      />
    </div>
  );
}
