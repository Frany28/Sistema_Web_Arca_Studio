import clsx from "clsx";

const CARD_SIZE_STYLES = {
  small: "w-[204px] shrink-0 max-[900px]:w-full",
  fluid: "min-w-0 flex-1",
  full: "w-full",
};

function GalleryImageCard({
  item,
  size = "fluid",
  className,
  imageClassName,
  onClick,
}) {
  if (!item) {
    return null;
  }

  const resolvedSize = CARD_SIZE_STYLES[size] ? size : "fluid";
  const interactiveProps = onClick
    ? {
        as: "button",
        type: "button",
        onClick,
      }
    : {
        as: "article",
      };
  const Component = interactiveProps.as;
  const componentProps = onClick
    ? {
        type: interactiveProps.type,
        onClick: interactiveProps.onClick,
      }
    : {};

  return (
    <Component
      {...componentProps}
      className={clsx(
        "group relative h-[212px] overflow-hidden rounded-[var(--radius-2)] text-left shadow-[var(--shadow-e2)]",
        onClick &&
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-100)]",
        "max-[768px]:h-[190px] max-[520px]:h-[176px]",
        CARD_SIZE_STYLES[resolvedSize],
        className,
      )}
    >
      <img
        src={item.image}
        alt={item.title}
        className={clsx(
          "h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]",
          imageClassName,
        )}
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.14)_40%,rgba(0,0,0,0.56)_100%)]" />

      <span className=" absolute inset-x-[10px] bottom-[10px] truncate text-heading-8 text-[var(--color-neutral-100-uniform)]">
        {item.title}
      </span>
    </Component>
  );
}

export default GalleryImageCard;
