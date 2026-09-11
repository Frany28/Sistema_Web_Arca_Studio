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

const SHARED_LAYOUT_TRANSITION = {
  type: "spring",
  damping: 28,
  stiffness: 280,
  mass: 0.8,
};

function getCardTransition(reduceMotion) {
  return reduceMotion ? { duration: 0 } : SHARED_LAYOUT_TRANSITION;
}

function FeaturedProjectsImageContent({ alt, src }) {
  return (
    <>
      <ProjectImage
        src={src}
        alt={alt}
        className="h-full w-full"
        imageClassName="object-cover"
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
        layoutId={`featured-project-image-${image.id}`}
        transition={getCardTransition(reduceMotion)}
        className="relative size-full overflow-hidden rounded-[var(--radius-2)]"
      >
        <FeaturedProjectsImageContent {...image} />
      </Motion.div>
      <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 motion-reduce:transition-none" />
    </button>
  );
}

function FeaturedProjectsActiveImage({ image, onClose, reduceMotion }) {
  return (
    <Motion.div
      layoutId={`featured-project-image-${image.id}`}
      transition={getCardTransition(reduceMotion)}
      className="absolute inset-0 z-20 overflow-hidden bg-[var(--color-neutral-10)]"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${image.alt}`}
      onClick={onClose}
    >
      <FeaturedProjectsImageContent {...image} />
    </Motion.div>
  );
}

function FeaturedProjectsGallery({ visible, onRevealComplete }) {
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
    <LayoutGroup id="featured-projects-gallery">
      <Motion.div
        data-featured-gallery
        data-node-id="4686:3913"
        aria-label="Galería de Quinta Bella Vista"
        aria-hidden={!visible}
        initial={false}
        animate={{ clipPath: getSectionRevealClip(visible) }}
        transition={getSectionRevealTransition(visible, reduceMotion)}
        onAnimationComplete={() => onRevealComplete?.(visible ? 2 : 1)}
        className="relative grid h-dvh min-h-[480px] grid-cols-3 gap-[24px] overflow-hidden bg-[var(--color-primary-500-uniform)] px-[24px] py-[48px] max-[767px]:gap-[8px] max-[767px]:px-[16px]"
      >
        <div className="contents" inert={activeImage ? "" : undefined}>
          {COLUMNS.map((cards, column) => (
            <div
              key={column}
              className={`grid min-h-0 min-w-0 gap-[24px] max-[767px]:gap-[8px] ${column === 1 ? "grid-rows-[128fr_552fr]" : "grid-rows-[384fr_296fr]"}`}
            >
              {cards.map((image, row) => {
                const imageWithId = {
                  ...image,
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
              reduceMotion={reduceMotion}
            />
          ) : null}
        </AnimatePresence>
      </Motion.div>
    </LayoutGroup>
  );
}

export default FeaturedProjectsGallery;
