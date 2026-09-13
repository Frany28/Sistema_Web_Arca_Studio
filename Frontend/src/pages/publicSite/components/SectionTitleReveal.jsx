import { useRef } from "react";
import { motion as Motion, useInView, useReducedMotion } from "motion/react";
import { getSectionRevealClip, getSectionRevealTransition } from "../utils/sectionReveal.js";

export default function SectionTitleReveal({ children, visible: requestedVisible, onRevealComplete, ...props }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduceMotion = useReducedMotion();
  // La sección puede habilitar el revelado antes de terminar el scroll programático.
  // Esperar también a que el título entre al viewport evita que la animación finalice
  // fuera de pantalla y conserva el replay al volver a la sección.
  const visible = Boolean(reduceMotion) || (
    inView && (requestedVisible ?? true)
  );

  return (
    <div {...props} ref={ref}>
      {/* El observador necesita una superficie que la máscara no recorte. */}
      <Motion.div
        className="flex w-full flex-col items-center gap-[inherit]"
        initial={false}
        animate={{ clipPath: getSectionRevealClip(visible) }}
        transition={getSectionRevealTransition(visible, reduceMotion)}
        onAnimationComplete={() => { if (visible) onRevealComplete?.(); }}
      >
        {children}
      </Motion.div>
    </div>
  );
}
