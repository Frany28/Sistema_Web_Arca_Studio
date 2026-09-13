import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGroup, motion as Motion, useReducedMotion } from "motion/react";

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

function getCardTransition(reduceMotion) {
  return reduceMotion ? { duration: 0 } : SHARED_LAYOUT_TRANSITION;
}

function FeaturedProjectsImageContent({ alt, fit = "cover", src }) {
  return (
    <>
      <ProjectImage
        src={src}
        alt={alt}
        fit={fit}
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
  projectId,
  reduceMotion,
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
      <Motion.div
        layoutId={`featured-project-image-${projectId}-${image.id}`}
        transition={getCardTransition(reduceMotion)}
        className="relative size-full overflow-hidden rounded-[var(--radius-2)]"
      >
        <FeaturedProjectsImageContent {...image} />
      </Motion.div>
      <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 motion-reduce:transition-none" />
    </button>
  );
}

function FeaturedProjectsActiveImage({
  closingTarget,
  image,
  mediaRef,
  onClose,
  onCloseComplete,
  projectId,
  reduceMotion,
}) {
  const isClosing = Boolean(closingTarget);
  const activeImage = (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      transition={getCardTransition(reduceMotion)}
      className="fixed inset-0 z-[60] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${image.alt}`}
      onClick={onClose}
      onAnimationComplete={() => {
        if (isClosing) onCloseComplete();
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[rgba(42,41,41,0.10)]"
        aria-hidden="true"
        style={{
          backdropFilter: "var(--effect-blur-b1)",
          WebkitBackdropFilter: "var(--effect-blur-b1)",
        }}
      />
      <div className="relative flex size-full items-center justify-center p-[24px] max-[640px]:p-[8px]">
        <Motion.div
          ref={mediaRef}
          animate={closingTarget ?? { x: 0, y: 0 }}
          transition={getCardTransition(reduceMotion)}
          className="relative h-full max-w-full shrink-0 overflow-hidden rounded-[var(--radius-2)]"
          style={{ aspectRatio: image.width / image.height }}
        >
          <Motion.div
            layoutId={`featured-project-image-${projectId}-${image.id}`}
            transition={getCardTransition(reduceMotion)}
            className="size-full"
          >
            <FeaturedProjectsImageContent {...image} fit="contain" />
          </Motion.div>
        </Motion.div>
      </div>
    </Motion.div>
  );

  return typeof document === "undefined"
    ? activeImage
    : createPortal(activeImage, document.body);
}

function FeaturedProjectsGallery({
  backgroundClassName = "bg-[var(--color-primary-500-uniform)]",
  columns = COLUMNS,
  galleryLabel = "Galería de Quinta Bella Vista",
  onRevealComplete,
  projectId = "quinta-bella-vista",
  visible = true,
}) {
  const [activeImage, setActiveImage] = useState(null);
  const [closingTarget, setClosingTarget] = useState(null);
  const triggerRefs = useRef(new Map());
  const lastActiveImageRef = useRef(null);
  const activeMediaRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const completeClose = useCallback(() => {
    const closedImageId = activeImage?.id;
    setActiveImage(null);
    setClosingTarget(null);
    window.requestAnimationFrame(() => {
      triggerRefs.current.get(closedImageId)?.focus();
    });
  }, [activeImage?.id]);

  const handleClose = useCallback(() => {
    if (!activeImage || closingTarget) return;

    const sourceRect = triggerRefs.current.get(activeImage.id)?.getBoundingClientRect();
    const mediaRect = activeMediaRef.current?.getBoundingClientRect();
    if (!sourceRect || !mediaRect || !mediaRect.width || !mediaRect.height) {
      completeClose();
      return;
    }

    // Se anima el contenedor, no la imagen por separado. ProjectImage con `contain`
    // conserva la proporción real del recurso aunque la tarjeta cambie de tamaño.
    setClosingTarget({
      x: sourceRect.left + (sourceRect.width / 2) - (mediaRect.left + (mediaRect.width / 2)),
      y: sourceRect.top + (sourceRect.height / 2) - (mediaRect.top + (mediaRect.height / 2)),
      width: sourceRect.width,
      height: sourceRect.height,
    });
  }, [activeImage, closingTarget, completeClose]);

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
    lastActiveImageRef.current = image.id;
    setClosingTarget(null);
    setActiveImage(image);
  };

  return (
    <LayoutGroup id={`featured-projects-gallery-${projectId}`}>
      <Motion.div
        data-featured-gallery
        data-node-id="4686:3913"
        aria-label={galleryLabel}
        aria-hidden={!visible}
        initial={false}
        animate={{ clipPath: getSectionRevealClip(visible) }}
        transition={getSectionRevealTransition(visible, reduceMotion)}
        onAnimationComplete={() => onRevealComplete?.(visible ? 2 : 1)}
        className={`relative grid h-dvh min-h-[480px] grid-cols-3 gap-[24px] overflow-hidden px-[24px] py-[48px] max-[767px]:gap-[8px] max-[767px]:px-[16px] ${backgroundClassName}`}
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
                    projectId={projectId}
                    reduceMotion={reduceMotion}
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

        {activeImage ? (
          <FeaturedProjectsActiveImage
            closingTarget={closingTarget}
            image={activeImage}
            mediaRef={activeMediaRef}
            onClose={handleClose}
            onCloseComplete={completeClose}
            projectId={projectId}
            reduceMotion={reduceMotion}
          />
        ) : null}
      </Motion.div>
    </LayoutGroup>
  );
}

export default FeaturedProjectsGallery;
