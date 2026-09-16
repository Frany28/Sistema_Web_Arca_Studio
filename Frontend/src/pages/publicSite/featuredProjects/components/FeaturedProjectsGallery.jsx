import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ExpoScaleEase } from "gsap/EasePack";
import { Flip } from "gsap/Flip";

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

gsap.registerPlugin(ExpoScaleEase, Flip);

function clampProgress(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(Math.max(progress, 0), 1);
}

function getSecondaryFinalPosition(cardId, rect, viewportWidth, viewportHeight) {
  const [column, row] = cardId.split("-").map(Number);
  const gutter = Math.max(24, Math.min(viewportWidth, viewportHeight) * 0.04);

  if (column === 0) {
    return {
      left: -rect.width - gutter,
      top: row === 0 ? -rect.height - gutter : viewportHeight + gutter,
    };
  }

  if (column === 2) {
    return {
      left: viewportWidth + gutter,
      top: row === 0 ? -rect.height - gutter : viewportHeight + gutter,
    };
  }

  return {
    left: (viewportWidth - rect.width) / 2,
    top: -rect.height - gutter,
  };
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
  const stageCardRefs = useRef(new Map());
  const stageRef = useRef(null);
  const flipContextRef = useRef(null);
  const flipTimelineRef = useRef(null);
  const renderedProgressRef = useRef(0);
  const resizeFrameRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const setCardRef = useCallback((cardId, element) => {
    if (element) cardRefs.current.set(cardId, element);
    else cardRefs.current.delete(cardId);
  }, []);

  const setStageCardRef = useCallback((cardId, element) => {
    if (element) stageCardRefs.current.set(cardId, element);
    else stageCardRefs.current.delete(cardId);
  }, []);

  const showOriginalCards = useCallback(() => {
    cardRefs.current.forEach((card) => {
      card.style.removeProperty("opacity");
      card.style.removeProperty("transform");
      card.style.removeProperty("visibility");
      card.style.removeProperty("will-change");
    });
  }, []);

  const hideOriginalCards = useCallback(() => {
    cardRefs.current.forEach((card) => {
      card.style.visibility = "hidden";
    });
  }, []);

  const clearFlipTimeline = useCallback(() => {
    flipContextRef.current?.revert();
    flipContextRef.current = null;
    flipTimelineRef.current = null;
  }, []);

  const createFlipTimeline = useCallback((progress) => {
    const stage = stageRef.current;
    const entries = [...stageCardRefs.current.entries()]
      .map(([cardId, stageCard]) => ({
        cardId,
        sourceCard: cardRefs.current.get(cardId),
        stageCard,
      }))
      .filter(({ sourceCard }) => sourceCard);

    if (!stage || entries.length === 0) return false;

    clearFlipTimeline();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const initialLayouts = entries.map((entry) => {
      const rect = entry.sourceCard.getBoundingClientRect();
      return {
        ...entry,
        borderRadius: Number.parseFloat(
          window.getComputedStyle(entry.sourceCard).borderTopLeftRadius,
        ) || 0,
        rect,
      };
    });

    flipContextRef.current = gsap.context(() => {
      initialLayouts.forEach(({ cardId, rect, stageCard }) => {
        const finalPosition = cardId === PRIMARY_CARD_ID
          ? { left: 0, top: 0 }
          : getSecondaryFinalPosition(
            cardId,
            rect,
            viewportWidth,
            viewportHeight,
          );

        gsap.set(stageCard, {
          borderRadius: 0,
          height: cardId === PRIMARY_CARD_ID ? viewportHeight : rect.height,
          left: finalPosition.left,
          top: finalPosition.top,
          width: cardId === PRIMARY_CARD_ID ? viewportWidth : rect.width,
          zIndex: cardId === PRIMARY_CARD_ID ? 2 : 1,
        });
      });

      const finalState = Flip.getState(
        initialLayouts.map(({ stageCard }) => stageCard),
        { props: "borderRadius" },
      );

      initialLayouts.forEach(({ borderRadius, rect, stageCard }) => {
        gsap.set(stageCard, {
          borderRadius,
          height: rect.height,
          left: rect.left,
          top: rect.top,
          width: rect.width,
        });
      });

      flipTimelineRef.current = Flip.to(finalState, {
        absolute: true,
        duration: 1,
        ease: "expoScale(1, 5)",
        paused: true,
        simple: true,
      });
    }, stage);

    flipTimelineRef.current?.progress(clampProgress(progress), false);
    return Boolean(flipTimelineRef.current);
  }, [clearFlipTimeline]);

  const renderExpansion = useCallback((rawProgress) => {
    const progress = clampProgress(rawProgress);
    const previousProgress = renderedProgressRef.current;
    const stage = stageRef.current;

    if (!stage || !active || progress <= 0) {
      if (stage) stage.style.visibility = "hidden";
      showOriginalCards();
      renderedProgressRef.current = progress;
      return;
    }

    const needsFreshLayout = !flipTimelineRef.current
      || previousProgress <= 0
      || (previousProgress >= 1 && progress < 1);

    if (needsFreshLayout && !createFlipTimeline(progress)) {
      stage.style.visibility = "hidden";
      showOriginalCards();
      renderedProgressRef.current = progress;
      return;
    }

    stage.style.visibility = "visible";
    hideOriginalCards();
    flipTimelineRef.current?.progress(progress, false);
    renderedProgressRef.current = progress;
  }, [active, createFlipTimeline, hideOriginalCards, showOriginalCards]);

  useLayoutEffect(() => {
    renderExpansion(expansionProgress?.get() ?? 0);
  }, [active, columns, expansionProgress, renderExpansion]);

  useEffect(() => {
    if (!expansionProgress?.on) return undefined;
    return expansionProgress.on("change", (progress) => {
      renderExpansion(progress);
    });
  }, [expansionProgress, renderExpansion]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }
      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        const progress = clampProgress(expansionProgress?.get() ?? 0);
        if (active && progress > 0) createFlipTimeline(progress);
        renderExpansion(progress);
      });
    };
    const primaryCard = cardRefs.current.get(PRIMARY_CARD_ID);
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleResize);

    if (primaryCard) resizeObserver?.observe(primaryCard);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [active, createFlipTimeline, expansionProgress, renderExpansion]);

  useEffect(() => () => {
    clearFlipTimeline();
    showOriginalCards();
  }, [clearFlipTimeline, showOriginalCards]);

  const stage = columns.length > 0 ? (
    <div
      ref={stageRef}
      aria-hidden="true"
      data-featured-gallery-stage
      className="pointer-events-none fixed inset-0 z-[55] overflow-hidden"
      style={{ visibility: "hidden" }}
    >
      {columns.flatMap((cards, column) => cards.map((image, row) => {
        const cardId = `${column}-${row}`;
        const primary = cardId === PRIMARY_CARD_ID;
        return (
          <div
            key={cardId}
            ref={(element) => setStageCardRef(cardId, element)}
            data-featured-gallery-overlay={primary ? "" : undefined}
            data-featured-gallery-stage-card=""
            className="absolute overflow-hidden rounded-[var(--radius-2)]"
          >
            <FeaturedProjectsImageContent {...image} />
          </div>
        );
      }))}
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

      {stage && typeof document !== "undefined"
        ? createPortal(stage, document.body)
        : stage}
    </>
  );
}

export default FeaturedProjectsGallery;
