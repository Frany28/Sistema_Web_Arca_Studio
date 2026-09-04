import { useEffect, useState } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";

import Login from "./Login.jsx";
import ArcaOpeningMark, {
  MOTION_DURATION_SECONDS,
} from "../components/ui/ArcaOpeningMark/ArcaOpeningMark.jsx";

const REDUCED_MOTION_DURATION_MS = 450;
const PANEL_TRANSITION_DURATION_SECONDS = 1.15;
const PANEL_TRANSITION_EASE = [0.815, 0.005, 0.17, 0.995];

function OpeningHome() {
  const reduceMotion = useReducedMotion();
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

        <div
          className="h-dvh shrink-0 overflow-y-auto"
          aria-hidden={phase !== "complete"}
        >
          <Login />
        </div>
      </Motion.div>
    </div>
  );
}

export default OpeningHome;
