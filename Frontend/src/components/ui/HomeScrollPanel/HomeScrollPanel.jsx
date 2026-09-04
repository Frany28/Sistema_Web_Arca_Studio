import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

import HomeHeroTitle from "../HomeHeroTitle/HomeHeroTitle.jsx";

const DOWNWARD_TITLE_REVEAL_RATIO = 0.35;
const UPWARD_TITLE_REVEAL_RATIO = 0.65;

function HomeScrollPanel({
  image,
  imageAlt,
  title,
  enabled = true,
  revealOnNextScroll = false,
}) {
  const panelRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const isInView = useInView(panelRef, {
    amount: revealOnNextScroll ? "some" : 0.6,
  });
  const [titleStepActive, setTitleStepActive] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    const scroller = panel?.closest("[data-home-scroll-container]");
    if (!revealOnNextScroll || !panel || !scroller) return undefined;

    const updateTitleStep = () => {
      const scrollTop = scroller.scrollTop;
      const previousScrollTop = lastScrollTopRef.current;
      const panelStart = panel.offsetTop;
      const panelEnd = panelStart + panel.offsetHeight;
      const isInsidePanel = scrollTop >= panelStart && scrollTop < panelEnd;
      const isScrollingUp = scrollTop < previousScrollTop;
      const revealRatio = isScrollingUp
        ? UPWARD_TITLE_REVEAL_RATIO
        : DOWNWARD_TITLE_REVEAL_RATIO;
      const revealPosition = panelStart + scroller.clientHeight * revealRatio;
      const nextStepActive =
        isInsidePanel &&
        (isScrollingUp
          ? scrollTop <= revealPosition
          : scrollTop >= revealPosition);

      lastScrollTopRef.current = scrollTop;

      setTitleStepActive((currentStepActive) =>
        currentStepActive === nextStepActive
          ? currentStepActive
          : nextStepActive,
      );
    };

    updateTitleStep();
    scroller.addEventListener("scroll", updateTitleStep, { passive: true });
    window.addEventListener("resize", updateTitleStep);

    return () => {
      scroller.removeEventListener("scroll", updateTitleStep);
      window.removeEventListener("resize", updateTitleStep);
    };
  }, [revealOnNextScroll]);

  const titleVisible =
    enabled &&
    isInView &&
    (revealOnNextScroll ? titleStepActive : true);
  const panelVisual = (
    <>
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/20"
        aria-hidden="true"
      />
      <HomeHeroTitle title={title} visible={titleVisible} />
    </>
  );

  if (revealOnNextScroll) {
    return (
      <section
        ref={panelRef}
        className="relative h-[200dvh] w-full shrink-0"
        aria-label={title}
        data-home-panel
      >
        <div
          className="relative h-dvh overflow-hidden bg-[var(--color-neutral-950-uniform)] motion-reduce:sticky motion-reduce:top-0"
          data-home-panel-visual
          data-home-scroll-step
        >
          {panelVisual}
        </div>
        <div
          className="h-dvh"
          aria-hidden="true"
          data-home-scroll-step
          data-home-title-step
        />
      </section>
    );
  }

  return (
    <section
      ref={panelRef}
      className="relative h-dvh w-full shrink-0"
      aria-label={title}
      data-home-panel
    >
      <div
        className="relative h-dvh overflow-hidden bg-[var(--color-neutral-950-uniform)]"
        data-home-panel-visual
        data-home-scroll-step
      >
        {panelVisual}
      </div>
    </section>
  );
}

export default HomeScrollPanel;
