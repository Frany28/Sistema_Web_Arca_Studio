import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { REVEAL_DELAY_SECONDS, REVEAL_DURATION_SECONDS } from "../../utils/sectionReveal.js";

gsap.registerPlugin(SplitText);

function FeaturedProjectsSection({ visible = false, onRevealComplete }) {
  const headingRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (!visible) return undefined;
    if (reduceMotion) {
      onRevealComplete?.();
      return undefined;
    }
    let disposed = false;
    const split = SplitText.create(headingRef.current.querySelectorAll("[data-reveal-lines]"), {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 100,
          duration: REVEAL_DURATION_SECONDS,
          delay: REVEAL_DELAY_SECONDS,
          stagger: 0.08,
          ease: "power2.out",
          onComplete: () => { if (!disposed) onRevealComplete?.(); },
        });
      },
    });
    return () => {
      disposed = true;
      split.revert();
    };
  }, [visible, reduceMotion, onRevealComplete]);

  return (
    <section
      id="featured-projects"
      aria-label="Proyectos destacados"
      className="dark min-h-dvh bg-[var(--color-neutral-950-uniform)] pt-[var(--spacing-gap-9)]"
    >
      <div
        ref={headingRef}
        aria-hidden={!visible}
        className={`mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[24px] px-[16px] py-[var(--spacing-gap-7)] text-center text-[var(--color-neutral-100-uniform)] min-[768px]:px-[48px] ${visible ? "visible" : "invisible"}`}
        data-node-id="4856:5032"
      >
        <p className="text-heading-4 m-0 w-full" data-reveal-lines data-node-id="4856:5033">
          Proyectos Destacados
        </p>
        <h2 className="text-heading-1 m-0 w-full max-[767px]:text-[38px] max-[767px]:leading-[46px]" data-reveal-lines data-node-id="4856:5034">
          Quinta Bella Vista
        </h2>
        <p className="text-heading-6 m-0 w-full max-w-[520px] opacity-60" data-reveal-lines data-node-id="4856:5035">
          Diseño arquitectónico y ejecución integral para una residencia contemporánea ubicada en Maracaibo.
        </p>
      </div>
    </section>
  );
}

export default FeaturedProjectsSection;
