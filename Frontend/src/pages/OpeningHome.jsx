import { motion as Motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";

import ArcaOpeningMark, {
  MOTION_DURATION_SECONDS,
} from "../components/ui/ArcaOpeningMark/ArcaOpeningMark.jsx";
import HomeHeader from "../components/ui/HomeHeader/HomeHeader.jsx";
import useHomeOpeningSequence from "../hooks/useHomeOpeningSequence.js";
import useHomeScrollController from "../hooks/useHomeScrollController.js";
import HomeSections from "./openingHome/components/HomeSections.jsx";
import { HOME_PRELOAD_IMAGES } from "./openingHome/homeContent.js";

const PANEL_TRANSITION_DURATION_SECONDS = 1.15;
const PANEL_TRANSITION_EASE = [0.815, 0.005, 0.17, 0.995];

function OpeningHome() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const {
    completeInitialTitleReveal,
    completePanelTransition,
    initialScrollReady,
    phase,
  } = useHomeOpeningSequence({
    imageSources: HOME_PRELOAD_IMAGES,
    motionDurationSeconds: MOTION_DURATION_SECONDS,
    reduceMotion,
  });
  const {
    navigationState,
    scrollerRef,
    statementPanelIndex,
    statementProgress,
  } = useHomeScrollController({
    enabled: phase === "complete" && initialScrollReady,
    initialScrollReady,
    reduceMotion,
  });
  const homeActive = phase === "complete";

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      aria-label="Transición de inicio de ARCA Studio"
    >
      <Motion.div
        className={`flex h-[200dvh] flex-col will-change-transform ${
          homeActive ? "pointer-events-auto" : "pointer-events-none"
        }`}
        initial={false}
        animate={{ y: phase === "opening" ? "0%" : "-50%" }}
        transition={{
          duration: reduceMotion ? 0 : PANEL_TRANSITION_DURATION_SECONDS,
          ease: PANEL_TRANSITION_EASE,
        }}
        onAnimationComplete={completePanelTransition}
      >
        <main
          className="flex h-dvh shrink-0 items-center justify-center overflow-hidden bg-[var(--color-primary-500-uniform)] px-[16px]"
          aria-label="Pantalla de carga de ARCA Studio"
          aria-hidden={homeActive}
        >
          <ArcaOpeningMark repeat={phase === "opening" ? Infinity : 0} />
        </main>

        <main
          ref={scrollerRef}
          className={`dark relative h-dvh shrink-0 touch-pan-x overflow-x-hidden overscroll-y-contain bg-[var(--color-neutral-950-uniform)] [scrollbar-gutter:stable] ${
            initialScrollReady ? "overflow-y-auto" : "overflow-y-hidden"
          }`}
          aria-hidden={!homeActive}
          aria-label="Secciones de inicio de ARCA Studio"
          data-home-scroll-container
          tabIndex={initialScrollReady ? 0 : -1}
        >
          <div className="pointer-events-none sticky top-0 z-30 h-0 overflow-visible">
            <HomeHeader
              className="pointer-events-auto"
              onRegister={() => navigate("/crear-cuenta")}
              onLogin={() => navigate("/login")}
            />
          </div>

          <HomeSections
            active={homeActive}
            navigationState={navigationState}
            onInitialTitleReveal={completeInitialTitleReveal}
            statementPanelIndex={statementPanelIndex}
            statementProgress={statementProgress}
          />
        </main>
      </Motion.div>
    </div>
  );
}

export default OpeningHome;
