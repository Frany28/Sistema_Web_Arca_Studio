import { motion as Motion, useReducedMotion } from "motion/react";
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

function FeaturedProjectsGallery({ visible, onRevealComplete }) {
  const reduceMotion = useReducedMotion();
  return (
    <Motion.div
      data-featured-gallery
      data-node-id="4686:3913"
      aria-label="Galería de Quinta Bella Vista"
      aria-hidden={!visible}
      initial={false}
      animate={{ clipPath: getSectionRevealClip(visible) }}
      transition={getSectionRevealTransition(visible, reduceMotion)}
      onAnimationComplete={() => onRevealComplete?.(visible ? 2 : 1)}
      className="relative grid h-dvh min-h-[480px] grid-cols-3 gap-[24px] bg-[var(--color-primary-500-uniform)] px-[24px] py-[48px] max-[767px]:gap-[8px] max-[767px]:px-[16px]"
    >
      {COLUMNS.map((cards, column) => (
        <div key={column} className={`grid min-h-0 min-w-0 gap-[24px] max-[767px]:gap-[8px] ${column === 1 ? "grid-rows-[335fr_569fr]" : "grid-rows-[568fr_336fr]"}`}>
          {cards.map(({ src, alt, branded }) => (
            <div key={src} className="relative min-h-0 overflow-hidden rounded-[var(--radius-2)]">
              <ProjectImage src={src} alt={alt} className="h-full w-full" imageClassName="object-cover" />
              {!branded && <MainLogo size="20px" appearance="dark" alt="" className="pointer-events-none absolute left-[16px] top-[16px]" />}
            </div>
          ))}
        </div>
      ))}
    </Motion.div>
  );
}

export default FeaturedProjectsGallery;
