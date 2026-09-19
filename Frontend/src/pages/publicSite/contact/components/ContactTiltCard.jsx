import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

import secondaryLogoMark from "../../../../assets/logos/secondaryLogoParts/mark.svg";
import secondaryLogoRegistration from "../../../../assets/logos/secondaryLogoParts/registration.svg";
import secondaryLogoDate from "../../../../assets/logos/secondaryLogoParts/date.svg";
import "./ContactTiltCard.css";

const TILT_INTENSITY = 12;
const GLARE_INTENSITY = 0.47;

function ContactTiltCard() {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const card = cardRef.current;
    const glare = glareRef.current;

    if (!card || !glare) return undefined;

    gsap.set(card, {
      rotationX: 0,
      rotationY: 0,
      transformPerspective: 200,
      transformOrigin: "center center",
    });
    gsap.set(glare, { opacity: 0, x: 0, y: 0 });

    if (reduceMotion) return undefined;

    const rotateXTo = gsap.quickTo(card, "rotationX", {
      duration: 0.42,
      ease: "power3.out",
    });
    const rotateYTo = gsap.quickTo(card, "rotationY", {
      duration: 0.42,
      ease: "power3.out",
    });
    const glareXTo = gsap.quickTo(glare, "x", {
      duration: 0.36,
      ease: "power2.out",
    });
    const glareYTo = gsap.quickTo(glare, "y", {
      duration: 0.36,
      ease: "power2.out",
    });
    const glareOpacityTo = gsap.quickTo(glare, "opacity", {
      duration: 0.24,
      ease: "power2.out",
    });

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;

      const rect = card.getBoundingClientRect();
      const pointerX = (event.clientX - rect.left) / rect.width;
      const pointerY = (event.clientY - rect.top) / rect.height;
      const offsetX = pointerX - 0.5;
      const offsetY = pointerY - 0.5;

      rotateXTo(-offsetY * TILT_INTENSITY);
      rotateYTo(offsetX * TILT_INTENSITY);
      glareXTo(offsetX * rect.width * 0.47);
      glareYTo(offsetY * rect.height * 0.47);
      glareOpacityTo(GLARE_INTENSITY);
    };

    const handlePointerLeave = (event) => {
      if (event.pointerType === "touch") return;

      rotateXTo(0);
      rotateYTo(0);
      glareXTo(0);
      glareYTo(0);
      glareOpacityTo(0);
    };

    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", handlePointerLeave);
      gsap.killTweensOf(card);
      gsap.killTweensOf(glare);
    };
  }, [reduceMotion]);

  return (
    <div className="contact-tilt-card w-full max-w-[432px] shrink-0">
      <div
        ref={cardRef}
        className="contact-tilt-card__surface relative aspect-[432/264.779] w-full overflow-hidden rounded-[var(--radius-4)] bg-[var(--color-primary-500-uniform)] will-change-transform"
        data-node-id="4856:5063"
      >
        <div
          className="contact-tilt-card__gradient pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div
          ref={glareRef}
          className="contact-tilt-card__glare pointer-events-none absolute z-10 will-change-transform"
          aria-hidden="true"
        />

        <div
          className="contact-tilt-card__logo relative z-20 h-full w-full overflow-hidden will-change-transform"
          data-node-id="4856:5064"
        >
          <img
            src={secondaryLogoMark}
            alt="ARCA Studio"
            className="absolute inset-x-0 top-0 block h-[90.93%] w-full"
          />
          <img
            src={secondaryLogoRegistration}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-[0.05%] block h-[5.1%] w-[23.35%]"
          />
          <img
            src={secondaryLogoDate}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 right-[0.05%] block h-[5.1%] w-[15.28%]"
          />
        </div>
      </div>
    </div>
  );
}

export default ContactTiltCard;
