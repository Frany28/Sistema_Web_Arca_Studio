import { useRef } from "react";
import { useInView } from "motion/react";

import HomeHeroTitle from "../HomeHeroTitle/HomeHeroTitle.jsx";

function HomeScrollPanel({ image, imageAlt, title, enabled = true }) {
  const panelRef = useRef(null);
  const isInView = useInView(panelRef, { amount: 0.6 });

  return (
    <section
      ref={panelRef}
      className="relative h-dvh w-full shrink-0 snap-start overflow-hidden bg-[var(--color-neutral-950-uniform)]"
      aria-label={title}
    >
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/20"
        aria-hidden="true"
      />
      <HomeHeroTitle title={title} visible={enabled && isInView} />
    </section>
  );
}

export default HomeScrollPanel;
