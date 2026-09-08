import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

const NAVBAR_SCROLL_DURATION_SECONDS = 0.2;
const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;

function getClosestScrollContainer(element) {
  let ancestor = element?.parentElement;

  while (ancestor && ancestor !== document.body) {
    const { overflowY } = window.getComputedStyle(ancestor);
    if (SCROLLABLE_OVERFLOW_PATTERN.test(overflowY)) return ancestor;
    ancestor = ancestor.parentElement;
  }

  return window;
}

function useScrollDirectionVisibility(targetRef, { scrollContainerRef } = {}) {
  const reduceMotion = useReducedMotion();

  // Espera a que React asigne también las refs de los contenedores ancestros.
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return undefined;

    if (reduceMotion) {
      gsap.set(target, { clearProps: "transform" });
      return undefined;
    }

    const scrollContainer =
      scrollContainerRef?.current ?? getClosestScrollContainer(target);
    const context = gsap.context(() => {
      const showAnimation = gsap
        .from(target, {
          yPercent: -100,
          paused: true,
          duration: NAVBAR_SCROLL_DURATION_SECONDS,
          ease: "power1.out",
        })
        .progress(1);

      ScrollTrigger.create({
        scroller: scrollContainer === window ? undefined : scrollContainer,
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (self.scroll() <= 0 || self.direction === -1) {
            showAnimation.play();
          } else {
            showAnimation.reverse();
          }
        },
      });
    }, target);

    return () => context.revert();
  }, [reduceMotion, scrollContainerRef, targetRef]);
}

export {
  getClosestScrollContainer,
  NAVBAR_SCROLL_DURATION_SECONDS,
};
export default useScrollDirectionVisibility;
