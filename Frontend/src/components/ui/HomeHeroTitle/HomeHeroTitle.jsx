import { motion as Motion, useReducedMotion } from "motion/react";

const REVEAL_DELAY_SECONDS = 0.4000000059604645;
const REVEAL_DURATION_SECONDS = 3.12408709526062;
const REVEAL_HEIGHT_COLLAPSED = 73;
const REVEAL_HEIGHT_EXPANDED = 255;

function HomeHeroTitle({ title, visible }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[clamp(160px,41.6dvh,319.5px)] z-[5] h-[385px] overflow-hidden"
      data-node-id="4473:112127"
    >
      <Motion.div
        className="absolute left-1/2 top-[clamp(28px,7.33dvh,56.3px)] w-[min(1200px,calc(100%-32px))] -translate-x-1/2 overflow-hidden"
        initial={false}
        animate={{
          height:
            visible || reduceMotion
              ? REVEAL_HEIGHT_EXPANDED
              : REVEAL_HEIGHT_COLLAPSED,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                duration: REVEAL_DURATION_SECONDS,
                bounce: 0.12,
                delay: visible ? REVEAL_DELAY_SECONDS : 0,
              }
        }
        data-node-id="4451:132680"
      >
        <h1
          className="absolute left-1/2 top-[89.5px] m-0 w-[min(1104px,calc(100%-32px))] -translate-x-1/2 text-center font-[var(--font-sans)] text-[clamp(48px,6.67vw,96px)] font-bold leading-[76px] tracking-[-2px] text-[var(--color-neutral-100-uniform)]"
          data-node-id="4451:132681"
        >
          {title}
        </h1>
      </Motion.div>
    </div>
  );
}

export {
  REVEAL_DELAY_SECONDS,
  REVEAL_DURATION_SECONDS,
  REVEAL_HEIGHT_COLLAPSED,
  REVEAL_HEIGHT_EXPANDED,
};
export default HomeHeroTitle;
