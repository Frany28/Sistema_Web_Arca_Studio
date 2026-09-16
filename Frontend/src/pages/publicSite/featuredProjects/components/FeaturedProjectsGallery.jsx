import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { motion as Motion, useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ExpoScaleEase } from "gsap/EasePack";


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
    {
      src: lighting,
      alt: "Iluminación y bloques de vidrio de Quinta Bella Vista",
    },
  ],
  [
    { src: living, alt: "Sala de Quinta Bella Vista" },
    { src: bathroom, alt: "Baño de Quinta Bella Vista" },
  ],
];

const PRIMARY_CARD_ID = "1-1";

gsap.registerPlugin(ExpoScaleEase);

function clampProgress(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(Math.max(progress, 0), 1);
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

function FeaturedProjectsGalleryCard({
  cardId,
  image,
  primary,
  setCardRef,
}) {
  return (
    <div
      ref={(element) => setCardRef(cardId, element)}
      data-featured-gallery-card
      data-card-id={cardId}
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
  const galleryRef = useRef(null);
  const gridRef = useRef(null);

  const cardRefs = useRef(new Map());

  const timelineRef = useRef(null);
  const contextRef = useRef(null);

  const resizeFrameRef = useRef(null);

  const reduceMotion = useReducedMotion();

  const setCardRef = useCallback((cardId, element) => {
    if (element) {
      cardRefs.current.set(cardId, element);
    } else {
      cardRefs.current.delete(cardId);
    }
  }, []);

  const destroyTimeline = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;

    contextRef.current?.revert();
    contextRef.current = null;
  }, []);

    const buildTimeline = useCallback(() => {
  const gallery = galleryRef.current;
  const cards = [...cardRefs.current.values()];
  const primary = cardRefs.current.get(PRIMARY_CARD_ID);

  if (
    !active ||
    !gallery ||
    !primary ||
    cards.length === 0
  ) {
    return false;
  }

  const currentProgress = clampProgress(
    expansionProgress?.get?.() ?? 0,
  );

  destroyTimeline();

  contextRef.current = gsap.context(() => {
    /*
     * Limpiamos cualquier transformación anterior antes
     * de medir la geometría Bento real.
     */
    cards.forEach((card) => {
      gsap.set(card, {
        clearProps:
          "transform,transformOrigin,opacity,zIndex",
      });
    });

    const primaryRect = primary.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    /*
     * Escala necesaria para que la imagen principal
     * cubra exactamente todo el viewport.
     */
    const scaleX =
      viewportWidth / primaryRect.width;

    const scaleY =
      viewportHeight / primaryRect.height;

    /*
     * Centro actual de la imagen principal.
     */
    const primaryCenterX =
      primaryRect.left + primaryRect.width / 2;

    const primaryCenterY =
      primaryRect.top + primaryRect.height / 2;

    /*
     * Centro final: centro del viewport.
     */
    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;

    const translateX =
      viewportCenterX - primaryCenterX;

    const translateY =
      viewportCenterY - primaryCenterY;

    const timeline = gsap.timeline({
      paused: true,
      defaults: {
        duration: 1,
        ease: "none",
      },
    });

    /*
     * --------------------------------------------------
     * IMAGEN PRINCIPAL
     * --------------------------------------------------
     *
     * No cambiamos position.
     * No usamos fixed.
     * No usamos absolute.
     *
     * Sigue perteneciendo al proyecto.
     */
    timeline.to(
      primary,
      {
        x: translateX,
        y: translateY,

        scaleX,
        scaleY,

        transformOrigin: "center center",

        borderRadius: 0,

        zIndex: 50,

        ease: "none",
      },
      0,
    );

    /*
     * --------------------------------------------------
     * IMÁGENES SECUNDARIAS
     * --------------------------------------------------
     *
     * Salen hacia el borde correspondiente.
     */
    cards.forEach((card) => {
      if (card === primary) return;

      const rect = card.getBoundingClientRect();

      const centerX =
        rect.left + rect.width / 2;

      const centerY =
        rect.top + rect.height / 2;

      const dx =
        centerX - viewportCenterX;

      const dy =
        centerY - viewportCenterY;

      let x = 0;
      let y = 0;

      /*
       * Priorizar el eje donde la card está más alejada
       * del centro.
       */
      if (Math.abs(dx) >= Math.abs(dy)) {
        x =
          dx < 0
            ? -(rect.right + rect.width)
            : viewportWidth -
              rect.left +
              rect.width;
      } else {
        y =
          dy < 0
            ? -(rect.bottom + rect.height)
            : viewportHeight -
              rect.top +
              rect.height;
      }

      timeline.to(
        card,
        {
          x,
          y,
          opacity: 0,
          ease: "none",
        },
        0,
      );
    });

    timelineRef.current = timeline;

    /*
     * Restaurar el progreso actual.
     */
    timeline.progress(currentProgress, false);
  }, gallery);

  return Boolean(timelineRef.current);
}, [
  active,
  destroyTimeline,
  expansionProgress,
]);

  const renderProgress = useCallback(
    (rawProgress) => {
      if (!active) return;

      const progress = clampProgress(rawProgress);

      if (!timelineRef.current) {
        buildTimeline();
      }

      timelineRef.current?.progress(progress, false);
    },
    [active, buildTimeline],
  );

  useLayoutEffect(() => {
    if (!active) {
      destroyTimeline();
      return undefined;
    }

    buildTimeline();

    return undefined;
  }, [
    active,
    columns,
    buildTimeline,
    destroyTimeline,
  ]);

  useEffect(() => {
    if (!expansionProgress?.on) return undefined;

    return expansionProgress.on("change", (progress) => {
      renderProgress(progress);
    });
  }, [
    expansionProgress,
    renderProgress,
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }

      resizeFrameRef.current = requestAnimationFrame(() => {
        resizeFrameRef.current = null;

        const progress = clampProgress(
          expansionProgress?.get?.() ?? 0,
        );

        buildTimeline();

        timelineRef.current?.progress(progress, false);
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }

      window.removeEventListener("resize", handleResize);
      window.removeEventListener(
        "orientationchange",
        handleResize,
      );
    };
  }, [
    buildTimeline,
    expansionProgress,
  ]);

  useEffect(() => {
    return () => {
      destroyTimeline();
    };
  }, [destroyTimeline]);

  return (
    <Motion.div
      ref={galleryRef}
      data-featured-gallery
      data-featured-image-gallery
      data-node-id="4686:3913"
      role="group"
      aria-label={galleryLabel}
      aria-hidden={!visible}
      initial={false}
      animate={{
        clipPath: getSectionRevealClip(visible),
      }}
      transition={getSectionRevealTransition(
        visible,
        reduceMotion,
      )}
      onAnimationComplete={() =>
        onRevealComplete?.(visible ? 2 : 1)
      }
      className={`relative ${containerClassName} overflow-visible ${backgroundClassName}`}
    >
      <div
        ref={gridRef}
        className="
          mx-auto
          grid
          h-full
          w-full
          max-w-[1441px]
          grid-cols-3
          gap-[24px]
          px-[24px]
          py-[48px]
          max-[767px]:gap-[8px]
          max-[767px]:px-[16px]
        "
      >
        {columns.map((cards, column) => (
          <div
            key={column}
            className={`
              grid
              min-h-0
              min-w-0
              gap-[24px]
              max-[767px]:gap-[8px]
              ${
                column === 1
                  ? "grid-rows-[335fr_569fr]"
                  : "grid-rows-[568fr_336fr]"
              }
            `}
          >
            {cards.map((image, row) => {
              const cardId = `${column}-${row}`;

              return (
                <FeaturedProjectsGalleryCard
                  key={cardId}
                  cardId={cardId}
                  image={image}
                  primary={
                    cardId === PRIMARY_CARD_ID
                  }
                  setCardRef={setCardRef}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Motion.div>
  );
}

export default FeaturedProjectsGallery;