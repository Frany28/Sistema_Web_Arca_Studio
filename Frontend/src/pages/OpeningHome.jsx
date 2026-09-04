import { useEffect, useState } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";

import constructionHeroAsset from "../assets/home/arca-construction-hero.png";
import homeHeroAsset from "../assets/home/arca-home-hero.png";
import ArcaOpeningMark, {
  MOTION_DURATION_SECONDS,
} from "../components/ui/ArcaOpeningMark/ArcaOpeningMark.jsx";
import HomeHeader from "../components/ui/HomeHeader/HomeHeader.jsx";
import HomeScrollPanel from "../components/ui/HomeScrollPanel/HomeScrollPanel.jsx";

const REDUCED_MOTION_DURATION_MS = 450;
const MAX_LOADING_DURATION_MS = 15000;
const PANEL_TRANSITION_DURATION_SECONDS = 1.15;
const PANEL_TRANSITION_EASE = [0.815, 0.005, 0.17, 0.995];

function preloadImage(source) {
  return new Promise((resolve) => {
    const image = new Image();
    const finish = () => resolve();

    image.onload = finish;
    image.onerror = finish;
    image.src = source;

    if (image.complete) {
      finish();
    }
  });
}

function OpeningHome() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("opening");

  useEffect(() => {
    let cancelled = false;
    const minimumDuration = reduceMotion
      ? REDUCED_MOTION_DURATION_MS
      : MOTION_DURATION_SECONDS * 1000;
    const timers = new Set();
    const wait = (duration) =>
      new Promise((resolve) => {
        const timerId = window.setTimeout(() => {
          timers.delete(timerId);
          resolve();
        }, duration);
        timers.add(timerId);
      });

    const resourcesReady = Promise.allSettled([
      preloadImage(homeHeroAsset),
      preloadImage(constructionHeroAsset),
      document.fonts?.ready ?? Promise.resolve(),
    ]);

    Promise.all([
      Promise.race([resourcesReady, wait(MAX_LOADING_DURATION_MS)]),
      wait(minimumDuration),
    ]).then(() => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
      if (!cancelled) {
        setPhase(reduceMotion ? "complete" : "transitioning");
      }
    });

    return () => {
      cancelled = true;
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
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
          <ArcaOpeningMark repeat={phase === "opening" ? Infinity : 0} />
        </main>

        <main
          className="dark relative h-dvh shrink-0 snap-y snap-mandatory scroll-smooth overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[var(--color-neutral-950-uniform)] [scrollbar-gutter:stable] motion-reduce:scroll-auto motion-reduce:snap-none"
          aria-hidden={phase !== "complete"}
          aria-label="Secciones de inicio de ARCA Studio"
          tabIndex={phase === "complete" ? 0 : -1}
        >
          <div className="pointer-events-none sticky top-0 z-30 h-0 overflow-visible">
            <HomeHeader
              className="pointer-events-auto"
              onRegister={() => navigate("/crear-cuenta")}
              onLogin={() => navigate("/login")}
            />
          </div>

          <HomeScrollPanel
            image={homeHeroAsset}
            imageAlt="Instalaciones industriales de ARCA Studio junto al mar"
            title="Arquitectura"
            enabled={phase === "complete"}
          />
          <HomeScrollPanel
            image={constructionHeroAsset}
            imageAlt="Baño construido por ARCA Studio con iluminación integrada"
            title="Construcción"
            showTitle={false}
          />
          <HomeScrollPanel
            image={constructionHeroAsset}
            imageAlt="Baño construido por ARCA Studio con iluminación integrada"
            title="Construcción"
          />
        </main>
      </Motion.div>
    </div>
  );
}

export default OpeningHome;
