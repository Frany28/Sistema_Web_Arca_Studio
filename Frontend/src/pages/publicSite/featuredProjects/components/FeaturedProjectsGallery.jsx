import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";
import mirror from "../../../../assets/featuredProjects/quinta-bella-vista-1.webp";
import bedroom from "../../../../assets/featuredProjects/quinta-bella-vista-2.webp";
import seating from "../../../../assets/featuredProjects/quinta-bella-vista-3.webp";
import living from "../../../../assets/featuredProjects/quinta-bella-vista-4.webp";
import bathroom from "../../../../assets/featuredProjects/quinta-bella-vista-5.webp";
import lighting from "../../../../assets/featuredProjects/quinta-bella-vista-6.webp";
import {
  getSectionRevealClip,
  getSectionRevealTransition,
} from "../../utils/sectionReveal.js";

const COLUMNS = [
  [
    { src: mirror, alt: "Espejos decorativos de Quinta Bella Vista" },
    { src: bedroom, alt: "Dormitorio de Quinta Bella Vista" },
  ],
  [
    { src: seating, alt: "Área de estar de Quinta Bella Vista" },
    { src: lighting, alt: "Iluminación y bloques de vidrio de Quinta Bella Vista" },
  ],
  [
    { src: living, alt: "Sala de Quinta Bella Vista" },
    { src: bathroom, alt: "Baño de Quinta Bella Vista" },
  ],
];

const IMAGE_DIMENSIONS = new Map([
  [mirror, { width: 2731, height: 4096 }],
  [bedroom, { width: 2528, height: 1684 }],
  [seating, { width: 4096, height: 2731 }],
  [living, { width: 4096, height: 2731 }],
  [bathroom, { width: 4096, height: 2731 }],
  [lighting, { width: 4096, height: 2731 }],
]);

const SHARED_LAYOUT_TRANSITION = {
  type: "spring",
  duration: 1.25,
  bounce: 0,
};

const VIEWER_PADDING_PX = 24;
const VIEWER_MOBILE_PADDING_PX = 8;
const VIEWER_MOBILE_BREAKPOINT_PX = 640;

function getCardTransition(reduceMotion) {
  return reduceMotion ? { duration: 0 } : SHARED_LAYOUT_TRANSITION;
}

function getExpandedImageRect(image) {
  const padding = window.innerWidth <= VIEWER_MOBILE_BREAKPOINT_PX
    ? VIEWER_MOBILE_PADDING_PX
    : VIEWER_PADDING_PX;
  const availableWidth = Math.max(1, window.innerWidth - (padding * 2));
  const availableHeight = Math.max(1, window.innerHeight - (padding * 2));
  const naturalWidth = image.width || availableWidth;
  const naturalHeight = image.height || availableHeight;
  const scale = Math.min(
    1,
    availableWidth / naturalWidth,
    availableHeight / naturalHeight,
  );
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;

  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

function getRectAnimation(rect) {
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function FeaturedProjectsImageContent({ alt, fit = "cover", src }) {
  return (
    <>
      <ProjectImage
        src={src}
        alt={alt}
        fit={fit}
        revealOnLoad={false}
        showLoader={false}
        className="flex h-full w-full items-center justify-center"
      />
      <MainLogo
        size="20px"
        appearance="dark"
        alt=""
        className="pointer-events-none absolute left-[16px] top-[16px]"
      />
    </>
  );
}

function FeaturedProjectsGalleryCard({
  activeImage,
  image,
  onOpen,
  triggerRef,
  visible,
}) {
  const isActive = activeImage?.id === image.id;

  if (isActive) {
    return <div ref={triggerRef} className="size-full" aria-hidden="true" />;
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      disabled={!visible}
      onClick={() => onOpen(image)}
      className="group relative size-full overflow-hidden rounded-[var(--radius-2)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary-500-uniform)] disabled:cursor-not-allowed"
      aria-label={`Ampliar imagen: ${image.alt}`}
    >
      <div className="relative size-full overflow-hidden rounded-[var(--radius-2)]">
        <FeaturedProjectsImageContent {...image} />
      </div>
      <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 motion-reduce:transition-none" />
    </button>
  );
}

function FeaturedProjectsActiveImage({
  expandedRect,
  image,
  isClosing,
  onClose,
  onCloseComplete,
  reduceMotion,
  sourceRect,
}) {
  const expandedAnimation = getRectAnimation(expandedRect);
  const sourceAnimation = getRectAnimation(sourceRect);
  const activeImage = (
    <div
      className="fixed inset-0 z-[60] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${image.alt}`}
      onClick={onClose}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[rgba(42,41,41,0.10)]"
        aria-hidden="true"
        style={{
          backdropFilter: "var(--effect-blur-b1)",
          WebkitBackdropFilter: "var(--effect-blur-b1)",
        }}
      />
      <Motion.div
        initial={reduceMotion ? expandedAnimation : sourceAnimation}
        animate={isClosing ? sourceAnimation : expandedAnimation}
        transition={getCardTransition(reduceMotion)}
        onAnimationComplete={() => {
          if (isClosing) onCloseComplete();
        }}
        className="fixed left-0 top-0 z-10 overflow-hidden rounded-[var(--radius-2)]"
      >
        <FeaturedProjectsImageContent {...image} />
      </Motion.div>
    </div>
  );

  return typeof document === "undefined"
    ? activeImage
    : createPortal(activeImage, document.body);
}

function FeaturedProjectsGallery({
  backgroundClassName = "bg-[var(--color-primary-500-uniform)]",
  columns = COLUMNS,
  containerClassName = "h-dvh min-h-[480px] shrink-0",
  galleryLabel = "Galería de Quinta Bella Vista",
  onRevealComplete,
  visible = true,
}) {
  const [activeImage, setActiveImage] = useState(null);
  const [sourceRect, setSourceRect] = useState(null);
  const [expandedRect, setExpandedRect] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const triggerRefs = useRef(new Map());
  const reduceMotion = useReducedMotion();

  const completeClose = useCallback(() => {
    const closedImageId = activeImage?.id;
    setActiveImage(null);
    setSourceRect(null);
    setExpandedRect(null);
    setIsClosing(false);
    window.requestAnimationFrame(() => {
      triggerRefs.current.get(closedImageId)?.focus();
    });
  }, [activeImage?.id]);

  const handleClose = useCallback(() => {
    if (!activeImage || isClosing) return;
    if (reduceMotion) {
      completeClose();
      return;
    }

    setIsClosing(true);
  }, [activeImage, completeClose, isClosing, reduceMotion]);

  useEffect(() => {
    if (!activeImage) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage, handleClose]);

  const handleOpen = (image) => {
    const cardRect = triggerRefs.current.get(image.id)?.getBoundingClientRect();
    if (!cardRect) return;

    setSourceRect({
      left: cardRect.left,
      top: cardRect.top,
      width: cardRect.width,
      height: cardRect.height,
    });
    setExpandedRect(getExpandedImageRect(image));
    setIsClosing(false);
    setActiveImage(image);
  };

  return (
    <Motion.div
      data-featured-gallery
      data-node-id="4686:3913"
      aria-label={galleryLabel}
      aria-hidden={!visible}
      initial={false}
      animate={{ clipPath: getSectionRevealClip(visible) }}
      transition={getSectionRevealTransition(visible, reduceMotion)}
      onAnimationComplete={() => onRevealComplete?.(visible ? 2 : 1)}
      className={`relative grid ${containerClassName} grid-cols-3 gap-[24px] overflow-hidden px-[24px] py-[48px] max-[767px]:gap-[8px] max-[767px]:px-[16px] ${backgroundClassName}`}
    >
      <div className="contents" inert={activeImage ? "" : undefined}>
        {columns.map((cards, column) => (
          <div
            key={column}
            className={`grid min-h-0 min-w-0 gap-[24px] max-[767px]:gap-[8px] ${column === 1 ? "grid-rows-[335fr_569fr]" : "grid-rows-[568fr_336fr]"}`}
          >
            {cards.map((image, row) => {
              const imageWithId = {
                ...image,
                ...IMAGE_DIMENSIONS.get(image.src),
                id: `${column}-${row}`,
              };

              return (
                <FeaturedProjectsGalleryCard
                  key={imageWithId.id}
                  activeImage={activeImage}
                  image={imageWithId}
                  onOpen={handleOpen}
                  triggerRef={(element) => {
                    if (element) triggerRefs.current.set(imageWithId.id, element);
                  }}
                  visible={visible}
                />
              );
            })}
          </div>
        ))}
      </div>

      {activeImage && sourceRect && expandedRect ? (
        <FeaturedProjectsActiveImage
          expandedRect={expandedRect}
          image={activeImage}
          isClosing={isClosing}
          onClose={handleClose}
          onCloseComplete={completeClose}
          reduceMotion={reduceMotion}
          sourceRect={sourceRect}
        />
      ) : null}
    </Motion.div>
  );
}

export default FeaturedProjectsGallery;
