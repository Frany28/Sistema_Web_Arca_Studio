import { useRef, useState } from "react";
import { useInView, useMotionValueEvent, useScroll } from "motion/react";

import HomeHeroTitle from "../HomeHeroTitle/HomeHeroTitle.jsx";

function HomeScrollPanel({
  image,
  imageAlt,
  title,
  enabled = true,
  revealOnNextScroll = false,
}) {
  const panelRef = useRef(null);
  const isInView = useInView(panelRef, {
    amount: revealOnNextScroll ? 0.25 : 0.6,
  });
  const [titleStepActive, setTitleStepActive] = useState(false);
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!revealOnNextScroll) return;

    const nextStepActive = progress >= 0.35;
    setTitleStepActive((currentStepActive) =>
      currentStepActive === nextStepActive
        ? currentStepActive
        : nextStepActive,
    );
  });

  const titleVisible =
    enabled && isInView && (!revealOnNextScroll || titleStepActive);
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
