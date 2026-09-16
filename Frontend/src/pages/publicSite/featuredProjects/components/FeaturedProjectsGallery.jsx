import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
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

const PRIMARY_CARD_ID = "1-1";
const SECONDARY_EXIT_PROGRESS = 0.68;

function clampProgress(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(Math.max(progress, 0), 1);
}

function interpolate(start, end, progress) {
  return start + (end - start) * progress;
}

function smoothStep(progress) {
  const value = clampProgress(progress);
  return value * value * (3 - (2 * value));
}

function FeaturedProjectsImageContent({
  alt,
  fit = "cover",
  imageClassName,
  src,
}) {
  return (
    <>
      <ProjectImage
        src={src}
        alt={alt}
        fit={fit}
        imageClassName={imageClassName}
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

function FeaturedProjectsGalleryCard({ cardId, image, primary, setCardRef }) {
  return (
    <div
      ref={(element) => setCardRef(cardId, element)}
      data-featured-gallery-primary={primary ? "" : undefined}
      className="relative size-full overflow-hidden rounded-[var(--radius-2)]"
    >
      <FeaturedProjectsImageContent {...image} />
    </div>
  );
}

function FeaturedProjectsGallery({
  active = false,
  backgroundClassName = "bg-[var(--color-primary-500-uniform)]",
  columns = COLUMNS,
  containerClassName = "h-[1024px] shrink-0",
  expansionProgress,
  galleryLabel = "Galería de Quinta Bella Vista",
  onRevealComplete,
  visible = true,
}) {
  const cardRefs = useRef(new Map());
  const geometryRef = useRef(null);
  const overlayRef = useRef(null);
  const renderedProgressRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const primaryImage = columns[1]?.[1] ?? columns.flat()[0];

  const setCardRef = useCallback((cardId, element) => {
    if (element) cardRefs.current.set(cardId, element);
    else cardRefs.current.delete(cardId);
  }, []);

  const resetCards = useCallback(() => {
    cardRefs.current.forEach((card) => {
      card.style.removeProperty("opacity");
      card.style.removeProperty("transform");
      card.style.removeProperty("visibility");
      card.style.removeProperty("will-change");
    });
  }, []);

  const measureGeometry = useCallback(() => {
    const primaryCard = cardRefs.current.get(PRIMARY_CARD_ID);
    if (!primaryCard) return null;

    const primaryRect = primaryCard.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const secondaryCards = [];

    cardRefs.current.forEach((card, cardId) => {
      if (cardId === PRIMARY_CARD_ID) return;
      const rect = card.getBoundingClientRect();
      secondaryCards.push({
        card,
        centerX: rect.left + (rect.width / 2),
        centerY: rect.top + (rect.height / 2),
      });
    });

    geometryRef.current = {
      borderRadius: Number.parseFloat(
        window.getComputedStyle(primaryCard).borderTopLeftRadius,
      ) || 0,
      primaryRect: {
        height: primaryRect.height,
        left: primaryRect.left,
        top: primaryRect.top,
        width: primaryRect.width,
      },
      secondaryCards,
      viewportHeight,
      viewportWidth,
    };

    return geometryRef.current;
  }, []);

  const renderExpansion = useCallback((rawProgress) => {
    const progress = clampProgress(rawProgress);
    const overlay = overlayRef.current;
    const primaryCard = cardRefs.current.get(PRIMARY_CARD_ID);
    renderedProgressRef.current = progress;

    if (!overlay || !primaryCard || !active || progress <= 0) {
      if (overlay) overlay.style.visibility = "hidden";
      resetCards();
      return;
    }

    const geometry = geometryRef.current ?? measureGeometry();
    if (!geometry) return;

    const {
      borderRadius,
      primaryRect,
      secondaryCards,
      viewportHeight,
      viewportWidth,
    } = geometry;
    const secondaryProgress = smoothStep(
      Math.min(progress / SECONDARY_EXIT_PROGRESS, 1),
    );

    primaryCard.style.visibility = "hidden";
    secondaryCards.forEach(({ card, centerX, centerY }) => {
      const offsetX = (centerX - (viewportWidth / 2)) * 0.12 * secondaryProgress;
      const offsetY = (centerY - (viewportHeight / 2)) * 0.12 * secondaryProgress;
      card.style.opacity = String(1 - secondaryProgress);
      card.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${1 - (secondaryProgress * 0.04)})`;
      card.style.willChange = "transform, opacity";
    });

    overlay.style.visibility = "visible";
    overlay.style.left = `${interpolate(primaryRect.left, 0, progress)}px`;
    overlay.style.top = `${interpolate(primaryRect.top, 0, progress)}px`;
    overlay.style.width = `${interpolate(primaryRect.width, viewportWidth, progress)}px`;
    overlay.style.height = `${interpolate(primaryRect.height, viewportHeight, progress)}px`;
    overlay.style.borderRadius = `${interpolate(borderRadius, 0, progress)}px`;
    overlay.style.willChange = "top, left, width, height, border-radius";
  }, [active, measureGeometry, resetCards]);

  useLayoutEffect(() => {
    geometryRef.current = null;
    renderExpansion(expansionProgress?.get() ?? 0);
  }, [active, expansionProgress, renderExpansion]);

  useEffect(() => {
    if (!expansionProgress?.on) return undefined;
    return expansionProgress.on("change", (progress) => {
      if (
        renderedProgressRef.current <= 0 ||
        (renderedProgressRef.current >= 1 && progress < 1)
      ) {
        geometryRef.current = null;
      }
      renderExpansion(progress);
    });
  }, [expansionProgress, renderExpansion]);

  useEffect(() => {
    const handleResize = () => {
      geometryRef.current = null;
      renderExpansion(expansionProgress?.get() ?? 0);
    };
    const primaryCard = cardRefs.current.get(PRIMARY_CARD_ID);
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleResize);

    if (primaryCard) resizeObserver?.observe(primaryCard);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [expansionProgress, renderExpansion]);

  useEffect(() => () => resetCards(), [resetCards]);

  const overlay = primaryImage ? (
    <div
      ref={overlayRef}
      aria-hidden="true"
      data-featured-gallery-overlay
      className="pointer-events-none fixed z-[55] overflow-hidden"
      style={{ visibility: "hidden" }}
    >
      <FeaturedProjectsImageContent {...primaryImage} />
    </div>
  ) : null;

  return (
    <>
      <Motion.div
        data-featured-gallery
        data-featured-image-gallery
        data-node-id="4686:3913"
        role="group"
        aria-label={galleryLabel}
        aria-hidden={!visible}
        initial={false}
        animate={{ clipPath: getSectionRevealClip(visible) }}
        transition={getSectionRevealTransition(visible, reduceMotion)}
        onAnimationComplete={() => onRevealComplete?.(visible ? 2 : 1)}
        className={`relative ${containerClassName} overflow-hidden ${backgroundClassName}`}
      >
        <div className="mx-auto grid h-full w-full max-w-[1441px] grid-cols-3 gap-[24px] px-[24px] py-[48px] max-[767px]:gap-[8px] max-[767px]:px-[16px]">
          {columns.map((cards, column) => (
            <div
              key={column}
              className={`grid min-h-0 min-w-0 gap-[24px] max-[767px]:gap-[8px] ${column === 1 ? "grid-rows-[335fr_569fr]" : "grid-rows-[568fr_336fr]"}`}
            >
              {cards.map((image, row) => {
                const cardId = `${column}-${row}`;
                return (
                  <FeaturedProjectsGalleryCard
                    key={cardId}
                    cardId={cardId}
                    image={image}
                    primary={cardId === PRIMARY_CARD_ID}
                    setCardRef={setCardRef}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </Motion.div>

      {overlay && typeof document !== "undefined"
        ? createPortal(overlay, document.body)
        : overlay}
    </>
  );
}

export default FeaturedProjectsGallery;
