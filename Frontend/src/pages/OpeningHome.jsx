import { useEffect, useState } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";

import homeHeroAsset from "../assets/home/arca-home-hero.png";
import ArcaOpeningMark, {
  MOTION_DURATION_SECONDS,
} from "../components/ui/ArcaOpeningMark/ArcaOpeningMark.jsx";
import HomeHeader from "../components/ui/HomeHeader/HomeHeader.jsx";
import HomeHeroTitle from "../components/ui/HomeHeroTitle/HomeHeroTitle.jsx";

const REDUCED_MOTION_DURATION_MS = 450;
const PANEL_TRANSITION_DURATION_SECONDS = 1.15;
const PANEL_TRANSITION_EASE = [0.815, 0.005, 0.17, 0.995];

function OpeningHome() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("opening");

  useEffect(() => {
    const duration = reduceMotion
      ? REDUCED_MOTION_DURATION_MS
      : MOTION_DURATION_SECONDS * 1000;
    const timeoutId = window.setTimeout(() => {
      setPhase(reduceMotion ? "complete" : "transitioning");
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      aria-label="Transición de inicio de ARCA Studio"
    >
      <Motion.div
        className={`flex h-[200dvh] flex-col will-change-transform ${
          phase === "complete" ? "pointer-events-auto" : "pointer-events-none"
        }`}
        initial={false}
        animate={{ y: phase === "opening" ? "0%" : "-50%" }}
        transition={{
          duration: reduceMotion ? 0 : PANEL_TRANSITION_DURATION_SECONDS,
          ease: PANEL_TRANSITION_EASE,
        }}
        onAnimationComplete={() => {
          if (phase === "transitioning") {
            setPhase("complete");
          }
        }}
      >
        <main
          className="flex h-dvh shrink-0 items-center justify-center overflow-hidden bg-[var(--color-primary-500-uniform)] px-[16px]"
          aria-label="Pantalla de carga de ARCA Studio"
          aria-hidden={phase === "complete"}
        >
          <ArcaOpeningMark repeat={0} />
        </main>

        <main
          className="dark relative h-dvh shrink-0 overflow-hidden bg-[var(--color-neutral-950-uniform)]"
          aria-hidden={phase !== "complete"}
        >
          <img
            src={homeHeroAsset}
            alt="Instalaciones industriales de ARCA Studio junto al mar"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/20"
            aria-hidden="true"
          />
          <HomeHeroTitle visible={phase === "complete"} />
          <HomeHeader
            className="absolute inset-x-0 top-0 z-10"
            onRegister={() => navigate("/crear-cuenta")}
            onLogin={() => navigate("/login")}
          />
        </main>
      </Motion.div>
    </div>
  );
}

export default OpeningHome;
