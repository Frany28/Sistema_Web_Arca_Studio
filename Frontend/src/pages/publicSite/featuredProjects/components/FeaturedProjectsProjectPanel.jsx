import { useRef } from "react";
import { motion as Motion, useInView, useReducedMotion } from "motion/react";

import projectImage from "../../../../assets/home/arca-home-hero.webp";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";
import HomeHeroTitle from "../../home/components/HomeHeroTitle/HomeHeroTitle.jsx";
import {
  getSectionRevealClip,
  getSectionRevealTransition,
} from "../../utils/sectionReveal.js";

/**
 * Presenta el siguiente proyecto destacado como una pantalla independiente
 * dentro de la secuencia, reutilizando el mismo revelado de las pantallas iniciales.
 */
function FeaturedProjectsProjectPanel() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const visible = Boolean(reduceMotion) || inView;

  return (
    <Motion.div
      ref={ref}
      data-featured-next-project
      data-node-id="4856:5037"
      aria-label="Proyecto destacado Muelle Zulima"
      initial={false}
      animate={{ clipPath: getSectionRevealClip(visible) }}
      transition={getSectionRevealTransition(visible, reduceMotion)}
      className="relative h-dvh min-h-[480px] w-full overflow-hidden bg-[var(--color-neutral-950-uniform)]"
    >
      <ProjectImage
        src={projectImage}
        alt="Oficina Taller de Reparaciones Marinas Muelle Zulima en Ciudad Ojeda"
        className="absolute inset-0 size-full"
        imageClassName="size-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/20"
        aria-hidden="true"
      />
      <HomeHeroTitle
        captionDescriptionNodeId="4856:5040"
        captionNodeId="4856:5039"
        captionTitleNodeId="4856:5041"
        description="Oficina Taller de Reparaciones Marinas | Ciudad Ojeda, Venezuela."
        projectName="Arquitectura"
        title="Muelle Zulima"
        visible={visible}
      />
    </Motion.div>
  );
}

export default FeaturedProjectsProjectPanel;
