import { useState } from "react";
import clsx from "clsx";

import { getFileDisplayName } from "../../../utils/fileDisplayName.js";
import ProjectImage from "../ProjectImage/ProjectImage.jsx";

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
  const imageSource = item?.image;
  const [imageState, setImageState] = useState({
    source: imageSource,
    status: "loading",
  });

  if (!item) {
    return null;
  }

  const imageStatus = imageState.source === imageSource
    ? imageState.status
    : "loading";

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
      <ProjectImage
        src={imageSource}
        alt={item.title}
        className="!absolute inset-0 !size-full"
        imageClassName={clsx(
          "size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]",
          imageClassName,
        )}
        onStatusChange={(status) =>
          setImageState({ source: imageSource, status })
        }
      />

      {imageStatus === "loaded" ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.14)_40%,rgba(0,0,0,0.56)_100%)]" />

          <span className="absolute inset-x-[10px] bottom-[10px] truncate text-heading-8 text-[var(--color-neutral-100-uniform)]">
            {getFileDisplayName(item.title)}
          </span>
        </>
      ) : null}
    </Component>
  );
}

export default GalleryImageCard;
