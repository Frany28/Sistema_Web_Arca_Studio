import { useRef } from "react";
import { motion as Motion, useInView, useReducedMotion } from "motion/react";
import { getSectionRevealClip, getSectionRevealTransition } from "../utils/sectionReveal.js";

export default function SectionTitleReveal({ children, ...props }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const visible = Boolean(reduceMotion) || inView;

  return (
    <Motion.div
      {...props}
      ref={ref}
      initial={false}
      animate={{ clipPath: getSectionRevealClip(visible) }}
      transition={getSectionRevealTransition(visible, reduceMotion)}
    >
      {children}
    </Motion.div>
  );
}
