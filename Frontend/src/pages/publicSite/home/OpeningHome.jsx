import { motion as Motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ArcaOpeningMark, {
  MOTION_DURATION_SECONDS,
} from "./components/ArcaOpeningMark/ArcaOpeningMark.jsx";
import PublicSiteHeader from "../components/PublicSiteHeader/PublicSiteHeader.jsx";
import HomeSections from "./components/HomeSections.jsx";
import ServicesSection from "../services/components/ServicesSection.jsx";
import useHomeOpeningSequence from "./hooks/useHomeOpeningSequence.js";
import useHomeScrollController from "./hooks/useHomeScrollController.js";
import { HOME_PRELOAD_IMAGES } from "./homeContent.js";

const PANEL_TRANSITION_DURATION_SECONDS = 1.15;
const PANEL_TRANSITION_EASE = [0.815, 0.005, 0.17, 0.995];

function OpeningHome() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { hash } = useLocation();
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
    completeTitleReveal,
    navigationState,
    navigateToSection,
    contentScrollActive,
    scrollerRef,
    statementPanelIndex,
    statementProgress,
  } = useHomeScrollController({
    enabled: phase === "complete" && initialScrollReady,
    initialScrollReady,
    reduceMotion,
  });
  const homeActive = phase === "complete";

  useEffect(() => {
    if (initialScrollReady && hash === "#services") navigateToSection("services");
  }, [hash, initialScrollReady, navigateToSection]);

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
          className={`dark relative h-dvh shrink-0 overflow-x-hidden overscroll-y-contain bg-[var(--color-neutral-950-uniform)] [scrollbar-gutter:stable] ${contentScrollActive ? "touch-auto" : "touch-pan-x"} ${
            initialScrollReady ? "overflow-y-auto" : "overflow-y-hidden"
          }`}
          aria-hidden={!homeActive}
          aria-label="Secciones de inicio de ARCA Studio"
          data-home-scroll-container
          tabIndex={initialScrollReady ? 0 : -1}
        >
          <div className="pointer-events-none sticky top-0 z-30 h-0 overflow-visible">
            <PublicSiteHeader
              className="pointer-events-auto"
              scrollContainerRef={scrollerRef}
              activeNavigationId={contentScrollActive ? "services" : undefined}
              onNavigate={navigateToSection}
              onRegister={() => navigate("/crear-cuenta")}
              onLogin={() => navigate("/login")}
            />
          </div>

          <HomeSections
            active={homeActive}
            navigationState={navigationState}
            onInitialTitleReveal={completeInitialTitleReveal}
            onTitleRevealComplete={completeTitleReveal}
            statementPanelIndex={statementPanelIndex}
            statementProgress={statementProgress}
          />
          {initialScrollReady && <ServicesSection />}
        </main>
      </Motion.div>
    </div>
  );
}

export default OpeningHome;
