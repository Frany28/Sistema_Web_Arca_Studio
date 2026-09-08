import { motion as Motion, useReducedMotion } from "motion/react";
import MovingGradientTitle from "./MovingGradientTitle.jsx";
import { getSectionRevealClip, getSectionRevealTransition } from "../../utils/sectionReveal.js";

function ServicesHeading({ eyebrow, title, description, visible = false }) {
  const reduceMotion = useReducedMotion();
  return (
    <Motion.section
      className="relative flex w-full shrink-0 justify-center overflow-hidden bg-[var(--color-neutral-950-uniform)] px-[16px] pt-[120px] min-[768px]:px-[48px]"
      aria-label={eyebrow}
      aria-hidden={!visible}
      initial={false}
      animate={{ clipPath: getSectionRevealClip(visible) }}
      transition={getSectionRevealTransition(visible, reduceMotion)}
    >
      <div
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
      </div>
    </Motion.section>
  );
}

export default ServicesHeading;
