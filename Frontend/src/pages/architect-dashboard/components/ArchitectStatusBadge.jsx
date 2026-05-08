import clsx from "clsx";

function ArchitectStatusBadge({ children, className }) {
  return (
    <span
      className={clsx(
        "inline-flex min-h-[24px] items-center rounded-full border px-[8px] py-[2px] text-body-4",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default ArchitectStatusBadge;
