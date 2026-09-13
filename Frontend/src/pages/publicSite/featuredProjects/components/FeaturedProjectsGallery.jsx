import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion as Motion,
  useReducedMotion,
} from "motion/react";

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
  damping: 34,
  stiffness: 180,
  mass: 1,
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
    return <div className="size-full" aria-hidden="true" />;
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

function FeaturedProjectsActiveImage({ image, onClose, projectId, reduceMotion }) {
  const activeImage = (
    <Motion.div
      layoutId={`featured-project-image-${projectId}-${image.id}`}
      transition={getCardTransition(reduceMotion)}
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
      <div className="relative flex size-full items-center justify-center p-[24px] max-[640px]:p-[8px]">
        <div
          className="relative h-full max-w-full shrink-0 overflow-hidden rounded-[var(--radius-2)]"
          style={{ aspectRatio: image.width / image.height }}
        >
          <FeaturedProjectsImageContent {...image} fit="contain" />
        </div>
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
  const triggerRefs = useRef(new Map());
  const lastActiveImageRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!activeImage) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage]);

  const handleOpen = (image) => {
    lastActiveImageRef.current = image.id;
    setActiveImage(image);
  };

  const handleClose = () => setActiveImage(null);

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

        <AnimatePresence
          initial={false}
          onExitComplete={() => {
            triggerRefs.current.get(lastActiveImageRef.current)?.focus();
          }}
        >
          {activeImage ? (
            <FeaturedProjectsActiveImage
              key={activeImage.id}
              image={activeImage}
              onClose={handleClose}
              projectId={projectId}
              reduceMotion={reduceMotion}
            />
          ) : null}
        </AnimatePresence>
      </Motion.div>
    </LayoutGroup>
  );
}

export default FeaturedProjectsGallery;
