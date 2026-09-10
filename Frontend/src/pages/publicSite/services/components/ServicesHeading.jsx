import MovingGradientTitle from "./MovingGradientTitle.jsx";
import { useRef } from "react";
import { motion as Motion, useInView, useReducedMotion } from "motion/react";
import { getSectionRevealClip, getSectionRevealTransition } from "../../utils/sectionReveal.js";

function ServicesHeading({ eyebrow, title, description }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const visible = useInView(sectionRef, { amount: 0.2 });
  return (
    <section
      ref={sectionRef}
      className="relative flex w-full shrink-0 justify-center overflow-hidden bg-[var(--color-neutral-950-uniform)] px-[16px] py-[var(--spacing-gap-7)] min-[768px]:px-[48px]"
      aria-label={eyebrow}
    >
      <Motion.div
        initial={{ clipPath: getSectionRevealClip(Boolean(reduceMotion)) }}
        animate={{ clipPath: getSectionRevealClip(Boolean(reduceMotion) || visible) }}
        transition={getSectionRevealTransition(visible, reduceMotion)}
        className="flex w-full max-w-[786px] flex-col items-center gap-[24px] text-center"
        data-node-id="4505:113281"
      >
        <p
          className="text-heading-4 text-[var(--color-neutral-100-uniform)]"
          data-node-id="4505:113286"
        >
          {eyebrow}
        </p>

        <MovingGradientTitle
          className="m-0 w-full text-[clamp(38px,4.45vw,64px)] font-bold leading-[clamp(46px,5.28vw,76px)] tracking-[clamp(-2px,-0.139vw,-1px)]"
          data-node-id="4505:113282"
        >
          {title}
        </MovingGradientTitle>

        <p
          className="text-heading-6 m-0 w-full break-words text-[18px] font-bold leading-[22px] tracking-[-0.5px] text-[var(--color-neutral-100-uniform)] opacity-60"
          data-node-id="4505:113283"
        >
          {description}
        </p>
      </Motion.div>
    </section>
  );
}

export default ServicesHeading;
