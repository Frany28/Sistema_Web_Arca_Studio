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

    if (!gallery || !grid || !active) return false;

    const cards = [...cardRefs.current.values()];
    const primary = cardRefs.current.get(PRIMARY_CARD_ID);

    if (!cards.length || !primary) return false;

    const currentProgress = clampProgress(
      expansionProgress?.get?.() ?? 0,
    );

    destroyTimeline();

    const galleryRect = gallery.getBoundingClientRect();

    contextRef.current = gsap.context(() => {
      /*
       * Guardamos el estado visual REAL de las cards.
       */
      const initialState = Flip.getState(cards, {
        props: "borderRadius",
      });

      /*
       * Creamos el estado final real del layout.
       *
       * No duplicamos elementos.
       * No usamos portal.
       * No ocultamos originales.
       *
       * Expandimos el grid completo como en el demo de GreenSock.
       */
      gsap.set(grid, {
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`,
        position: "fixed",
        inset: 0,
        maxWidth: "none",
        padding: 0,
        gap: 0,
        zIndex: 55,
      });

      cards.forEach((card) => {
        const id = card.dataset.cardId;

        if (id === PRIMARY_CARD_ID) {
          gsap.set(card, {
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100dvh",
            borderRadius: 0,
            zIndex: 2,
          });

          return;
        }

        const rect = card.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        const dx = centerX - viewportCenterX;
        const dy = centerY - viewportCenterY;

        /*
         * Sacamos las imágenes secundarias en la dirección
         * natural que ya tienen respecto al centro.
         */
        gsap.set(card, {
          x:
            dx === 0
              ? 0
              : Math.sign(dx) *
                (window.innerWidth + rect.width),
          y:
            dy === 0
              ? -window.innerHeight
              : Math.sign(dy) *
                (window.innerHeight + rect.height),
          opacity: 0,
          borderRadius: 0,
        });
      });

      /*
       * Capturamos el estado final.
       */
      const finalState = Flip.getState(cards, {
        props: "borderRadius,opacity",
      });

      /*
       * Volvemos inmediatamente al estado inicial.
       */
      Flip.setState(initialState);

      gsap.set(grid, {
        clearProps:
          "position,inset,width,height,maxWidth,padding,gap,zIndex",
      });

      cards.forEach((card) => {
        gsap.set(card, {
          clearProps:
            "position,inset,width,height,x,y,opacity,zIndex,borderRadius",
        });
      });

      /*
       * Creamos UN solo timeline reversible.
       */
      const timeline = gsap.timeline({
        paused: true,
      });

      const flip = Flip.to(finalState, {
        absolute: true,
        duration: 1,
        ease: "expoScale(1, 5)",
        simple: false,
        nested: true,
        prune: true,
        paused: true,
      });

      timeline.add(flip, 0);

      /*
       * La central domina progresivamente.
       */
      timeline.to(
        primary,
        {
          borderRadius: 0,
          duration: 1,
          ease: "none",
        },
        0,
      );

      timelineRef.current = timeline;

      timeline.progress(currentProgress, false);

      /*
       * Forzamos que la geometría de referencia
       * sea la del viewport actual.
       */
      gsap.set(gallery, {
        "--featured-gallery-viewport-width": `${galleryRect.width}px`,
      });
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