import clsx from "clsx";
import * as IconsaxIcons from "iconsax-react";
import {
  ICON_CONTAINER_SIZE_STYLES,
  ICON_CONTAINER_TYPE_STYLES,
} from "./iconContainerConfig.js";

function FallbackCloudPlusIcon({ size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8.5 18.5H16C18.7614 18.5 21 16.2614 21 13.5C21 11.0503 19.2386 9.01203 16.9121 8.58235C16.4844 5.95006 14.2044 4 11.5 4C8.52246 4 6.0807 6.36475 6.00219 9.32336C3.6905 9.56671 2 11.5229 2 13.8496C2 16.3475 4.02511 18.3726 6.52295 18.3726H8.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5V16.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M9 13.5H15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DefaultCloudPlusIcon({ size = 16, className, variant = "Linear" }) {
  const CloudPlus = IconsaxIcons.CloudPlus;

  if (CloudPlus) {
    return (
      <CloudPlus
        size={size}
        variant={variant}
        color="currentColor"
        className={className}
      />
    );
  }

  return <FallbackCloudPlusIcon size={size} className={className} />;
}

function IconContainer({
  className,
  size = "S",
  type = "Outline",
  icon = null,
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}) {
  const resolvedSize = ICON_CONTAINER_SIZE_STYLES[size] ? size : "S";
  const resolvedType = ICON_CONTAINER_TYPE_STYLES[type] ? type : "Outline";
  const sizeStyles = ICON_CONTAINER_SIZE_STYLES[resolvedSize];
  const visualStyles = ICON_CONTAINER_TYPE_STYLES[resolvedType];
  const isDecorative = decorative && !ariaLabel;

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-[var(--radius-2)]",
        sizeStyles.container,
        visualStyles,
        className,
      )}
      aria-hidden={isDecorative ? "true" : undefined}
      aria-label={!isDecorative ? ariaLabel : undefined}
      {...props}
    >
      <span className="inline-flex shrink-0 items-center justify-center">
        {icon ?? (
          <DefaultCloudPlusIcon
            size={sizeStyles.icon}
            variant="Linear"
            className="shrink-0"
          />
        )}
      </span>
    </span>
  );
}

export default IconContainer;
