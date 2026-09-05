import { motion as Motion, useReducedMotion } from "motion/react";

const SERVICES_REVEAL_DURATION_SECONDS = 0.7;
const SERVICES_REVEAL_EASE = [0.22, 1, 0.36, 1];

function ServicesHeading({ eyebrow, title, description }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative flex h-dvh w-full shrink-0 justify-center overflow-hidden bg-[var(--color-neutral-950-uniform)] px-[16px] pt-[clamp(112px,18dvh,184px)] min-[768px]:px-[48px]"
      aria-label={eyebrow}
    >
      <Motion.div
        className="flex w-full max-w-[786px] flex-col items-center gap-[24px] text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : SERVICES_REVEAL_DURATION_SECONDS,
          ease: SERVICES_REVEAL_EASE,
        }}
        data-node-id="4505:113281"
      >
        <p
          className="text-heading-4 text-[var(--color-neutral-100-uniform)]"
          data-node-id="4505:113286"
        >
          {eyebrow}
        </p>

        <h2
          className="m-0 bg-[linear-gradient(90deg,var(--color-accent-300)_0%,var(--color-primary-300)_50%,var(--color-accent-300)_100%)] bg-clip-text text-[clamp(38px,4.45vw,64px)] font-bold leading-[clamp(46px,5.28vw,76px)] tracking-[clamp(-2px,-0.139vw,-1px)] text-transparent opacity-70"
          data-node-id="4505:113282"
        >
          {title}
        </h2>

        <p
          className="text-heading-6 m-0 text-[var(--color-neutral-100-uniform)] opacity-60"
          data-node-id="4505:113283"
        >
          {description}
        </p>
      </Motion.div>
    </section>
  );
}

export {
  SERVICES_REVEAL_DURATION_SECONDS,
  SERVICES_REVEAL_EASE,
};
export default ServicesHeading;
