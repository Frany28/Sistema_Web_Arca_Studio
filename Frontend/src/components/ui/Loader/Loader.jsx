import clsx from "clsx";

const LOADER_VARIANTS = {
  inline: {
    circle: "size-[20px]",
    firstLine: "h-[6px] w-[36px]",
    secondLine: "h-[6px] w-[52px]",
  },
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
  count = 1,
  label = "Cargando datos",
  variant = "default",
}) {
  const variantClasses = LOADER_VARIANTS[variant] || LOADER_VARIANTS.default;
  const itemCount = Math.max(1, Math.floor(Number(count) || 1));

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
      <div aria-hidden="true" className="flex flex-col gap-[var(--spacing-gap-4)]">
        {Array.from({ length: itemCount }, (_, index) => (
          <div
            key={index}
            className={clsx(
              "flex flex-row items-center gap-[var(--spacing-gap-2)]",
            )}
          >
            <div className={clsx("shrink-0 rounded-[var(--radius-full)] bg-[var(--color-neutral-300)] motion-safe:animate-pulse", variantClasses.circle)} />
            <div className="flex flex-col gap-[var(--spacing-gap-2)]">
              <div className={clsx("rounded-[var(--radius-full)] bg-[var(--color-neutral-300)] motion-safe:animate-pulse", variantClasses.firstLine)} />
              <div className={clsx("rounded-[var(--radius-full)] bg-[var(--color-neutral-300)] motion-safe:animate-pulse", variantClasses.secondLine)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Loader;
