import { useLayoutEffect, useRef } from "react";
import clsx from "clsx";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "motion/react";

import MovingGradientTitle from "./MovingGradientTitle.jsx";

gsap.registerPlugin(SplitText);

const SERVICES_LINE_REVEAL_PERCENT = 120;
const SERVICES_LINE_STAGGER_SECONDS = 0.1;
const SERVICES_REVEAL_DURATION_SECONDS = 0.8;
const SERVICES_ELEMENT_DELAY_SECONDS = 0.12;

function ServicesHeading({ eyebrow, title, description }) {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const splitElements = gsap.utils.toArray(
      "[data-services-split]",
      container,
    );

    if (reduceMotion) {
      gsap.set(splitElements, { visibility: "visible" });
      return undefined;
    }

    let disposed = false;
    const splits = [];
    const context = gsap.context(() => {
      document.fonts.ready.then(() => {
        if (disposed) return;

        gsap.set(splitElements, { visibility: "visible" });
        splitElements.forEach((element, elementIndex) => {
          const split = SplitText.create(element, {
            type: "words,lines",
            mask: "lines",
            linesClass: "services-heading-line",
            autoSplit: true,
            onSplit: (instance) =>
              gsap.from(instance.lines, {
                yPercent: SERVICES_LINE_REVEAL_PERCENT,
                opacity: 0,
                duration: SERVICES_REVEAL_DURATION_SECONDS,
                delay: elementIndex * SERVICES_ELEMENT_DELAY_SECONDS,
                stagger: SERVICES_LINE_STAGGER_SECONDS,
                ease: "power3.out",
              }),
          });
          splits.push(split);
        });
      });
    }, container);

    return () => {
      disposed = true;
      splits.forEach((split) => split.revert());
      context.revert();
    };
  }, [reduceMotion]);

  return (
    <section
      className="relative flex w-full shrink-0 justify-center overflow-hidden bg-[var(--color-neutral-950-uniform)] px-[16px] pt-[120px] min-[768px]:px-[48px]"
      aria-label={eyebrow}
    >
      <div
        ref={containerRef}
        className="flex w-full max-w-[786px] flex-col items-center gap-[24px] text-center"
        data-node-id="4505:113281"
      >
        <p
          className={clsx(
            "text-heading-4 text-[var(--color-neutral-100-uniform)]",
            !reduceMotion && "invisible",
          )}
          data-services-split
          data-node-id="4505:113286"
        >
          {eyebrow}
        </p>

        <MovingGradientTitle
          className={clsx(
            "m-0 w-full text-[clamp(38px,4.45vw,64px)] font-bold leading-[clamp(46px,5.28vw,76px)] tracking-[clamp(-2px,-0.139vw,-1px)]",
            !reduceMotion && "invisible",
          )}
          data-services-split
          data-node-id="4505:113282"
        >
          {title}
        </MovingGradientTitle>

        <p
          className={clsx(
            "text-heading-6 m-0 w-full break-words text-[18px] font-bold leading-[22px] tracking-[-0.5px] text-[var(--color-neutral-100-uniform)] opacity-60",
            !reduceMotion && "invisible",
          )}
          data-services-split
          data-node-id="4505:113283"
        >
          {description}
        </p>
      </div>
    </section>
  );
}

export default ServicesHeading;

export {
  SERVICES_ELEMENT_DELAY_SECONDS,
  SERVICES_LINE_REVEAL_PERCENT,
  SERVICES_LINE_STAGGER_SECONDS,
  SERVICES_REVEAL_DURATION_SECONDS,
};
