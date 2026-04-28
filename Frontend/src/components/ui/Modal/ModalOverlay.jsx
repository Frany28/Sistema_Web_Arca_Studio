import clsx from "clsx";

const MODAL_OVERLAY_VARIANTS = {
  blurred: {
    className: "bg-[rgba(42,41,41,0.10)]",
    style: {
      backdropFilter: "var(--effect-blur-b1)",
      WebkitBackdropFilter: "var(--effect-blur-b1)",
    },
  },
  transparent: {
    className: "bg-transparent",
    style: {
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
    },
  },
};

function ModalOverlay({
  className,
  variant = "blurred",
  style,
  onClose,
  onClick,
  ...props
}) {
  const resolvedVariant = MODAL_OVERLAY_VARIANTS[variant] ? variant : "blurred";
  const visual = MODAL_OVERLAY_VARIANTS[resolvedVariant];

  return (
    <div
      className={clsx("absolute inset-0", visual.className, className)}
      style={{
        ...visual.style,
        ...style,
      }}
      aria-hidden="true"
      onClick={(event) => {
        onClick?.(event);

        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
      {...props}
    />
  );
}

export default ModalOverlay;
