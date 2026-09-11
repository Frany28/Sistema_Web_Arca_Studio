import { useEffect, useRef } from "react";
import {
  motion as Motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";
import mirror from "../../../../assets/featuredProjects/quinta-bella-vista-1.webp";
import bedroom from "../../../../assets/featuredProjects/quinta-bella-vista-2.webp";
import seating from "../../../../assets/featuredProjects/quinta-bella-vista-3.webp";
import living from "../../../../assets/featuredProjects/quinta-bella-vista-4.webp";
import bathroom from "../../../../assets/featuredProjects/quinta-bella-vista-5.webp";
import lighting from "../../../../assets/featuredProjects/quinta-bella-vista-6.webp";
import { getSectionRevealClip, getSectionRevealTransition } from "../../utils/sectionReveal.js";

const COLUMNS = [
  [{ src: mirror, alt: "Espejos decorativos de Quinta Bella Vista" }, { src: bedroom, alt: "Dormitorio de Quinta Bella Vista", branded: true }],
  [{ src: seating, alt: "Área de estar de Quinta Bella Vista" }, { src: lighting, alt: "Iluminación y bloques de vidrio de Quinta Bella Vista" }],
  [{ src: living, alt: "Sala de Quinta Bella Vista" }, { src: bathroom, alt: "Baño de Quinta Bella Vista", branded: true }],
];

const PARALLAX_OFFSETS = [
  [28, -28],
  [-16, 16],
  [36, -36],
];

function getGalleryScrollProgress(gallery, scroller) {
  const start = gallery.offsetTop - scroller.clientHeight;
  const end = gallery.offsetTop + gallery.offsetHeight;
  const progress = (scroller.scrollTop - start) / Math.max(end - start, 1);

  return Math.min(1, Math.max(0, progress));
}

function FeaturedProjectsGallery({ visible, onRevealComplete }) {
  const galleryRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const scrollProgress = useMotionValue(0);
  const smoothScrollProgress = useSpring(scrollProgress, {
    damping: 28,
    stiffness: 180,
  });
  const leftColumnOffset = useTransform(smoothScrollProgress, [0, 1], PARALLAX_OFFSETS[0]);
  const middleColumnOffset = useTransform(smoothScrollProgress, [0, 1], PARALLAX_OFFSETS[1]);
  const rightColumnOffset = useTransform(smoothScrollProgress, [0, 1], PARALLAX_OFFSETS[2]);
  const columnOffsets = [leftColumnOffset, middleColumnOffset, rightColumnOffset];

  useEffect(() => {
    const gallery = galleryRef.current;
    const scroller = gallery?.closest("[data-home-scroll-container]");

    if (!gallery || !scroller || reduceMotion) {
      scrollProgress.set(0);
      return undefined;
    }

    let frameId = null;
    const updateProgress = () => {
      frameId = null;
      scrollProgress.set(getGalleryScrollProgress(gallery, scroller));
    };
    const requestProgressUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };
    const resizeObserver = new ResizeObserver(requestProgressUpdate);

    resizeObserver.observe(gallery);
    resizeObserver.observe(scroller);
    scroller.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);
    requestProgressUpdate();

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      scroller.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, [reduceMotion, scrollProgress]);

  return (
    <Motion.div
      ref={galleryRef}
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
      {COLUMNS.map((cards, column) => (
        <Motion.div
          key={column}
          className={`grid min-h-0 min-w-0 gap-[24px] will-change-transform max-[767px]:gap-[8px] ${column === 1 ? "grid-rows-[335fr_569fr]" : "grid-rows-[568fr_336fr]"}`}
          style={{ y: reduceMotion ? 0 : columnOffsets[column] }}
        >
          {cards.map(({ src, alt }) => (
            <div key={src} className="group relative min-h-0 overflow-hidden rounded-[var(--radius-2)]">
              <ProjectImage
                src={src}
                alt={alt}
                className="h-full w-full"
                imageClassName="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <MainLogo size="20px" appearance="dark" alt="" className="pointer-events-none absolute left-[16px] top-[16px]" />
            </div>
          ))}
        </Motion.div>
      ))}
    </Motion.div>
  );
}

export default FeaturedProjectsGallery;
