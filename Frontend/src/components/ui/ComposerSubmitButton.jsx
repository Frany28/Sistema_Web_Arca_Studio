import Tooltip from "./Tooltip/Tooltip.jsx";

function SendIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
      aria-hidden="true"
    >
      <path
        d="M7.92473 3.52462L15.0581 7.09129C18.2581 8.69129 18.2581 11.308 15.0581 12.908L7.92473 16.4746C3.12473 18.8746 1.1664 16.908 3.5664 12.1163L4.2914 10.6746C4.47473 10.308 4.47473 9.69962 4.2914 9.33296L3.5664 7.88296C1.1664 3.09129 3.13306 1.12462 7.92473 3.52462Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.53345 10H9.03345"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ComposerSubmitButton({ ariaLabel, disabled = false, onClick, tooltip = ariaLabel }) {
  return (
    <Tooltip asChild portal showTip text={tooltip} tipPosition="Top right">
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        className="flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-2)] text-[var(--color-neutral-300)] transition-colors duration-200 hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-text-300)] disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onClick}
      >
        <SendIcon />
      </button>
    </Tooltip>
  );
}

export default ComposerSubmitButton;
