import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion as Motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";

import constructionHeroAsset from "../assets/home/arca-construction-hero.png";
import homeHeroAsset from "../assets/home/arca-home-hero.png";
import interiorDesignHeroAsset from "../assets/home/arca-interior-design-hero.png";
import ArcaOpeningMark, {
  MOTION_DURATION_SECONDS,
} from "../components/ui/ArcaOpeningMark/ArcaOpeningMark.jsx";
import HomeHeader from "../components/ui/HomeHeader/HomeHeader.jsx";
import HomeScrollPanel from "../components/ui/HomeScrollPanel/HomeScrollPanel.jsx";

const REDUCED_MOTION_DURATION_MS = 450;
const MAX_LOADING_DURATION_MS = 15000;
const PANEL_TRANSITION_DURATION_SECONDS = 1.15;
const PANEL_TRANSITION_EASE = [0.815, 0.005, 0.17, 0.995];

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

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
  const homeScrollerRef = useRef(null);

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
      preloadImage(interiorDesignHeroAsset),
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

  useLayoutEffect(() => {
    const scroller = homeScrollerRef.current;
    if (phase !== "complete" || reduceMotion || !scroller) return undefined;

    const context = gsap.context(() => {
      const panels = gsap.utils.toArray("[data-home-panel]", scroller);
      const steps = gsap.utils.toArray("[data-home-scroll-step]", scroller);
      let activeTween;
      let unlockTimer;
      let wheelIdleTimer;
      let wheelGestureReady = true;
      let currentStepIndex = Math.round(
        scroller.scrollTop / scroller.clientHeight,
      );
      let downwardLocked = false;
      let lockedScrollPosition = Number.POSITIVE_INFINITY;

      panels.forEach((panel) => {
        const visual = panel.querySelector("[data-home-panel-visual]");
        if (!visual) return;

        ScrollTrigger.create({
          trigger: panel,
          scroller,
          start: "top top",
          end: "bottom top",
          pin: visual,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      });

      ScrollTrigger.refresh();

      const releaseScroll = () => {
        downwardLocked = false;
        lockedScrollPosition = Number.POSITIVE_INFINITY;
        unlockTimer = undefined;
      };

      const moveToStep = (direction) => {
        if (direction > 0 && downwardLocked) return;

        if (direction < 0) {
          window.clearTimeout(unlockTimer);
          activeTween?.kill();
          releaseScroll();
        }

        const nextStepIndex = gsap.utils.clamp(
          0,
          steps.length - 1,
          currentStepIndex + direction,
        );
        if (nextStepIndex === currentStepIndex) return;

        currentStepIndex = nextStepIndex;
        downwardLocked = direction > 0;
        lockedScrollPosition = nextStepIndex * scroller.clientHeight;
        activeTween = gsap.to(scroller, {
          scrollTo: { y: lockedScrollPosition, autoKill: false },
          duration: reduceMotion ? 0 : 0.7,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            activeTween = undefined;
            const holdDuration =
              direction > 0
                ? Number(steps[nextStepIndex]?.dataset.homeStepHoldMs || 0)
                : 0;

            if (holdDuration > 0 && !reduceMotion) {
              unlockTimer = window.setTimeout(releaseScroll, holdDuration);
              return;
            }

            releaseScroll();
          },
        });
      };

      const handleWheel = (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

        event.preventDefault();
        window.clearTimeout(wheelIdleTimer);
        wheelIdleTimer = window.setTimeout(() => {
          wheelGestureReady = true;
        }, 180);
        if (!wheelGestureReady) return;

        wheelGestureReady = false;
        moveToStep(event.deltaY > 0 ? 1 : -1);
      };

      const enforceTitleHold = () => {
        if (downwardLocked && scroller.scrollTop > lockedScrollPosition) {
          scroller.scrollTop = lockedScrollPosition;
        }
      };

      scroller.addEventListener("wheel", handleWheel, { passive: false });
      scroller.addEventListener("scroll", enforceTitleHold, { passive: true });

      return () => {
        window.clearTimeout(unlockTimer);
        window.clearTimeout(wheelIdleTimer);
        activeTween?.kill();
        scroller.removeEventListener("wheel", handleWheel);
        scroller.removeEventListener("scroll", enforceTitleHold);
      };
    }, scroller);

    return () => context.revert();
  }, [phase, reduceMotion]);

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
          ref={homeScrollerRef}
          className="dark relative h-dvh shrink-0 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[var(--color-neutral-950-uniform)] [scrollbar-gutter:stable]"
          aria-hidden={phase !== "complete"}
          aria-label="Secciones de inicio de ARCA Studio"
          data-home-scroll-container
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
            revealOnNextScroll
          />
          <HomeScrollPanel
            image={interiorDesignHeroAsset}
            imageAlt="Sala interior diseñada por ARCA Studio con iluminación ambiental"
            title="Interiorismo"
            revealOnNextScroll
          />
        </main>
      </Motion.div>
    </div>
  );
}

export default OpeningHome;
