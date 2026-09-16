import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
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

gsap.registerPlugin(Flip, ExpoScaleEase);

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
    const grid = gridRef.current;
    const cards = [...cardRefs.current.values()];
    const primary = cardRefs.current.get(PRIMARY_CARD_ID);

    if (
      !active ||
      !gallery ||
      !grid ||
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
       * Guardamos las propiedades inline actuales para poder
       * devolver físicamente el DOM a su estado original.
       */
      const savedGridCss = grid.style.cssText;

      const savedCardCss = new Map(
        cards.map((card) => [
          card,
          card.style.cssText,
        ]),
      );

      /*
       * ---------------------------------------------------------
       * ESTADO FINAL
       * ---------------------------------------------------------
       *
       * Construimos temporalmente cómo debe verse la galería
       * cuando expansionProgress === 1.
       */

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      /*
       * Primero obtenemos las posiciones originales.
       * Es importante medir ANTES de modificar el layout.
       */
      const originalRects = new Map(
        cards.map((card) => [
          card,
          card.getBoundingClientRect(),
        ]),
      );

      /*
       * La tarjeta principal terminará ocupando todo el viewport.
       *
       * Las secundarias salen físicamente hacia los bordes.
       */
      cards.forEach((card) => {
        const cardId = card.dataset.cardId;
        const rect = originalRects.get(card);

        if (!rect) return;

        if (cardId === PRIMARY_CARD_ID) {
          gsap.set(card, {
            position: "fixed",
            left: 0,
            top: 0,
            width: viewportWidth,
            height: viewportHeight,
            margin: 0,
            borderRadius: 0,
            opacity: 1,
            zIndex: 56,
          });

          return;
        }

        const cardCenterX =
          rect.left + rect.width / 2;

        const cardCenterY =
          rect.top + rect.height / 2;

        const viewportCenterX =
          viewportWidth / 2;

        const viewportCenterY =
          viewportHeight / 2;

        let x = 0;
        let y = 0;

        /*
         * Sacamos cada tarjeta siguiendo su posición
         * natural dentro del Bento.
         */
        if (cardCenterX < viewportCenterX) {
          x = -(rect.right + rect.width);
        } else if (cardCenterX > viewportCenterX) {
          x =
            viewportWidth -
            rect.left +
            rect.width;
        }

        if (cardCenterY < viewportCenterY) {
          y = -(rect.bottom + rect.height);
        } else {
          y =
            viewportHeight -
            rect.top +
            rect.height;
        }

        gsap.set(card, {
          x,
          y,
          opacity: 0,
          borderRadius: 0,
          zIndex: 1,
        });
      });

      /*
       * Guardamos ese estado FINAL.
       */
      const finalState = Flip.getState(cards, {
        props: "borderRadius,opacity",
      });

      /*
       * ---------------------------------------------------------
       * RESTAURAR ESTADO ORIGINAL
       * ---------------------------------------------------------
       *
       * NO usamos Flip.setState().
       *
       * Restauramos exactamente los estilos inline que existían
       * antes de construir el estado final.
       */
      grid.style.cssText = savedGridCss;

      cards.forEach((card) => {
        card.style.cssText =
          savedCardCss.get(card) ?? "";
      });

      /*
       * Forzar cálculo de layout antes de crear Flip.
       */
      void grid.offsetWidth;

      /*
       * ---------------------------------------------------------
       * FLIP SCRUBBED
       * ---------------------------------------------------------
       *
       * El DOM está nuevamente en Bento,
       * pero finalState contiene fullscreen.
       *
       * Flip interpola:
       *
       * Bento ---------------> Fullscreen
       *   0                       1
       */
      const flip = Flip.to(finalState, {
        absolute: true,
        duration: 1,
        paused: true,

        /*
         * Este ease es importante para acercarnos al movimiento
         * orgánico del ejemplo de GreenSock.
         */
        ease: "expoScale(1, 5)",

        simple: false,
        nested: true,
        prune: true,

        /*
         * No permitir que otro tween anterior compita.
         */
        overwrite: true,
      });

      timelineRef.current = flip;

      /*
       * Recuperar inmediatamente el progreso actual.
       *
       * Esto evita saltos cuando se reconstruye por resize.
       */
      flip.progress(currentProgress, false);
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
      className={`relative ${containerClassName} overflow-hidden ${backgroundClassName}`}
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