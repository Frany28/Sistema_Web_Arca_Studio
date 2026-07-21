import clsx from "clsx";

const LOADER_VARIANTS = {
  compact: {
    circle: "size-[32px]",
    firstLine: "h-[12px] w-[80px]",
    secondLine: "h-[12px] w-[112px]",
  },
  default: {
    circle: "size-[48px]",
    firstLine: "h-[20px] w-[112px]",
    secondLine: "h-[20px] w-[144px]",
  },
  responsive: {
    circle: "size-[32px] md:size-[48px]",
    firstLine: "h-[12px] w-[80px] md:h-[20px] md:w-[112px]",
    secondLine: "h-[12px] w-[112px] md:h-[20px] md:w-[144px]",
  },
};

function Loader({
  align = "start",
  className,
  label = "Cargando datos",
  variant = "default",
}) {
  const variantClasses = LOADER_VARIANTS[variant] || LOADER_VARIANTS.default;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={clsx(
        "flex w-full",
        align === "center"
          ? "items-center justify-center"
          : "items-start justify-start",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="flex flex-row items-center gap-[var(--spacing-gap-2)]"
      >
        <div
          className={clsx(
            "shrink-0 rounded-[var(--radius-full)] bg-[var(--color-neutral-300)] motion-safe:animate-pulse",
            variantClasses.circle,
          )}
        />
        <div className="flex flex-col gap-[var(--spacing-gap-2)]">
          <div
            className={clsx(
              "rounded-[var(--radius-full)] bg-[var(--color-neutral-300)] motion-safe:animate-pulse",
              variantClasses.firstLine,
            )}
          />
          <div
            className={clsx(
              "rounded-[var(--radius-full)] bg-[var(--color-neutral-300)] motion-safe:animate-pulse",
              variantClasses.secondLine,
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default Loader;
