import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  motion as Motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useNavigate } from "react-router-dom";

import constructionHeroAsset from "../assets/home/arca-construction-hero.png";
import homeHeroAsset from "../assets/home/arca-home-hero.png";
import interiorDesignHeroAsset from "../assets/home/arca-interior-design-hero.png";
import statementVideoMp4Asset from "../assets/home/arca-statement-bg.mp4";
import statementVideoWebmAsset from "../assets/home/arca-statement-bg.webm";
import statementPosterAsset from "../assets/home/arca-statement-poster.webp";
import ArcaOpeningMark, {
  MOTION_DURATION_SECONDS,
} from "../components/ui/ArcaOpeningMark/ArcaOpeningMark.jsx";
import HomeHeader from "../components/ui/HomeHeader/HomeHeader.jsx";
import HomeScrollPanel from "../components/ui/HomeScrollPanel/HomeScrollPanel.jsx";
import HomeStatementPanel from "../components/ui/HomeStatementPanel/HomeStatementPanel.jsx";
import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  advanceWheelGesture,
  createHomeScrollState,
  createScrollbarHomeScrollState,
  createWheelGestureState,
  getKeyboardDirection,
  getNearestPanelIndex,
  getNextHomeScrollState,
  getSwipeDirection,
  normalizeWheelDelta,
} from "../utils/homeScrollNavigation.js";

const REDUCED_MOTION_DURATION_MS = 450;
const MAX_LOADING_DURATION_MS = 15000;
const PANEL_TRANSITION_DURATION_SECONDS = 1.15;
const SCROLL_STEP_DURATION_SECONDS = 0.5;
const PANEL_TRANSITION_EASE = [0.815, 0.005, 0.17, 0.995];
const WHEEL_GESTURE_THRESHOLD_PX = 32;
const WHEEL_GESTURE_IDLE_MS = 180;
const SCROLL_SETTLE_DELAY_MS = 180;
const TOUCH_SWIPE_THRESHOLD_PX = 48;
const TOUCH_VERTICAL_DOMINANCE = 1.2;
const STATEMENT_PANEL_INDEX = 3;
const STATEMENT_KEYBOARD_DURATION_SECONDS = 0.35;
const STATEMENT_PHRASE = "Piénsalo y lo hacemos realidad.";
const INITIAL_NAVIGATION_STATE = createHomeScrollState();

gsap.registerPlugin(ScrollToPlugin);

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
  const [navigationState, setNavigationState] = useState(
    INITIAL_NAVIGATION_STATE,
  );
  const [initialScrollReady, setInitialScrollReady] = useState(false);
  const homeScrollerRef = useRef(null);
  const navigationStateRef = useRef(INITIAL_NAVIGATION_STATE);
  const statementProgress = useMotionValue(0);

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
        if (reduceMotion) {
          setInitialScrollReady(true);
          setPhase("complete");
        } else {
          setPhase("transitioning");
        }
      }
    });

    return () => {
      cancelled = true;
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, [reduceMotion]);

  useLayoutEffect(() => {
    if (!initialScrollReady && homeScrollerRef.current) {
      homeScrollerRef.current.scrollTop = 0;
    }
  }, [initialScrollReady, phase]);

  useLayoutEffect(() => {
    const scroller = homeScrollerRef.current;
    if (phase !== "complete" || !initialScrollReady || !scroller) {
      return undefined;
    }

    const panels = gsap.utils.toArray("[data-home-panel]", scroller);
    let activeTween;
    let resizeFrame;
    let scrollSettleTimer;
    let statementFrame;
    let statementDelta = 0;
    let statementTween;
    let statementWheelScrubbing = false;
    let wheelIdleTimer;
    let wheelGestureState = createWheelGestureState();
    let touchGesture = null;
    let isProgrammaticScroll = false;
    let ignoreNextScrollEnd = false;
    const supportsScrollEnd = "onscrollend" in scroller;

    const commitNavigationState = (nextState) => {
      navigationStateRef.current = nextState;
      setNavigationState(nextState);
    };

    const commitStatementProgress = (nextProgress) => {
      const currentState = navigationStateRef.current;
      statementProgress.set(nextProgress);

      if (currentState.panelIndex !== STATEMENT_PANEL_INDEX) return;

      const nextPhase =
        nextProgress <= 0
          ? HOME_SCROLL_PHASES.IMAGE
          : nextProgress >= 1
            ? HOME_SCROLL_PHASES.TITLE
            : HOME_SCROLL_PHASES.EFFECT;

      if (currentState.phase === nextPhase) return;

      commitNavigationState({
        panelIndex: STATEMENT_PANEL_INDEX,
        phase: nextPhase,
        entryDirection:
          nextPhase === HOME_SCROLL_PHASES.IMAGE
            ? HOME_SCROLL_DIRECTIONS.DOWN
            : null,
      });
    };

    const queueStatementDelta = (deltaY) => {
      statementDelta += deltaY;
      if (statementFrame) return;

      statementFrame = window.requestAnimationFrame(() => {
        statementFrame = undefined;
        const pendingDelta = statementDelta;
        statementDelta = 0;

        if (
          activeTween ||
          navigationStateRef.current.panelIndex !== STATEMENT_PANEL_INDEX
        ) {
          return;
        }

        const nextProgress = advanceHomeStatementProgress(
          statementProgress.get(),
          pendingDelta,
          scroller.clientHeight,
          reduceMotion,
        );

        commitStatementProgress(nextProgress);
        if (nextProgress === 0 || nextProgress === 1) {
          statementWheelScrubbing = false;
        }
      });
    };

    const alignToPanel = (nextState) => {
      if (activeTween) return false;

      const currentState = navigationStateRef.current;
      const panelChanged = nextState.panelIndex !== currentState.panelIndex;
      const targetPanel = panels[nextState.panelIndex];
      const targetScrollTop = targetPanel?.offsetTop ?? 0;
      const needsAlignment = Math.abs(scroller.scrollTop - targetScrollTop) > 1;

      statementTween?.kill();
      statementTween = undefined;
      if (nextState.panelIndex === STATEMENT_PANEL_INDEX) {
        statementProgress.set(
          nextState.phase === HOME_SCROLL_PHASES.TITLE ? 1 : 0,
        );
      } else if (currentState.panelIndex === STATEMENT_PANEL_INDEX) {
        statementProgress.set(0);
      }

      commitNavigationState(nextState);

      if (!panelChanged && !needsAlignment) {
        return true;
      }

      isProgrammaticScroll = true;
      ignoreNextScrollEnd = supportsScrollEnd;

      if (reduceMotion) {
        scroller.scrollTop = targetScrollTop;
        window.requestAnimationFrame(() => {
          isProgrammaticScroll = false;
        });
        return true;
      }

      activeTween = gsap.to(scroller, {
        scrollTo: { y: targetScrollTop, autoKill: false },
        duration: SCROLL_STEP_DURATION_SECONDS,
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => {
          activeTween = undefined;
          isProgrammaticScroll = false;
        },
      });

      return true;
    };

    const moveByDirection = (direction) => {
      if (activeTween) return false;

      const currentState = navigationStateRef.current;
      const nextState = getNextHomeScrollState(
        currentState,
        direction,
        panels.length,
      );

      if (nextState === currentState) return false;

      return alignToPanel(nextState);
    };

    const animateStatementTo = (targetProgress) => {
      statementTween?.kill();
      statementTween = undefined;

      if (reduceMotion) {
        commitStatementProgress(targetProgress);
        return;
      }

      const animatedProgress = { value: statementProgress.get() };
      commitNavigationState({
        panelIndex: STATEMENT_PANEL_INDEX,
        phase: HOME_SCROLL_PHASES.EFFECT,
        entryDirection: null,
      });
      statementTween = gsap.to(animatedProgress, {
        value: targetProgress,
        duration: STATEMENT_KEYBOARD_DURATION_SECONDS,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => statementProgress.set(animatedProgress.value),
        onComplete: () => {
          statementTween = undefined;
          commitStatementProgress(targetProgress);
        },
      });
    };

    const resetWheelGesture = () => {
      wheelGestureState = createWheelGestureState();
      statementWheelScrubbing = false;
    };

    const handleWheel = (event) => {
      const delta = normalizeWheelDelta(event, scroller.clientHeight);

      if (Math.abs(delta.y) <= Math.abs(delta.x)) return;

      event.preventDefault();
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(
        resetWheelGesture,
        WHEEL_GESTURE_IDLE_MS,
      );

      statementTween?.kill();
      statementTween = undefined;

      const currentState = navigationStateRef.current;
      const isStatementReady =
        currentState.panelIndex === STATEMENT_PANEL_INDEX && !activeTween;

      if (isStatementReady && statementWheelScrubbing) {
        queueStatementDelta(delta.y);
        return;
      }

      wheelGestureState = advanceWheelGesture(
        wheelGestureState,
        delta.y,
        WHEEL_GESTURE_THRESHOLD_PX,
        event.timeStamp,
      );

      if (
        isStatementReady &&
        wheelGestureState.triggeredDirection !== null
      ) {
        const direction = wheelGestureState.triggeredDirection;
        const currentProgress = statementProgress.get();

        if (
          currentProgress <= 0 &&
          direction === HOME_SCROLL_DIRECTIONS.UP
        ) {
          moveByDirection(direction);
          return;
        }

        if (
          currentProgress >= 1 &&
          direction === HOME_SCROLL_DIRECTIONS.DOWN
        ) {
          return;
        }

        statementWheelScrubbing = true;
        queueStatementDelta(wheelGestureState.accumulator);
        return;
      }

      if (
        !activeTween &&
        wheelGestureState.triggeredDirection !== null
      ) {
        moveByDirection(wheelGestureState.triggeredDirection);
      }
    };

    const handlePointerDown = (event) => {
      if (event.pointerType !== "touch" || !event.isPrimary) return;

      touchGesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        consumed: false,
      };
    };

    const handlePointerMove = (event) => {
      if (
        !touchGesture ||
        touchGesture.pointerId !== event.pointerId ||
        touchGesture.consumed
      ) {
        return;
      }

      const direction = getSwipeDirection(
        {
          startX: touchGesture.startX,
          startY: touchGesture.startY,
          endX: event.clientX,
          endY: event.clientY,
        },
        {
          threshold: TOUCH_SWIPE_THRESHOLD_PX,
          verticalDominance: TOUCH_VERTICAL_DOMINANCE,
        },
      );

      if (direction === null) return;

      event.preventDefault();
      touchGesture.consumed = true;
      moveByDirection(direction);
    };

    const clearTouchGesture = (event) => {
      if (touchGesture?.pointerId === event.pointerId) {
        touchGesture = null;
      }
    };

    const isInteractiveTarget = (target) =>
      target instanceof Element &&
      Boolean(
        target.closest(
          'a, button, input, select, textarea, [contenteditable="true"], [role="button"]',
        ),
      );

    const handleKeyDown = (event) => {
      const direction = getKeyboardDirection(event);
      if (direction === null || isInteractiveTarget(event.target)) return;

      event.preventDefault();
      if (event.repeat) return;

      moveByDirection(direction);
    };

    const settleNativeScroll = () => {
      window.clearTimeout(scrollSettleTimer);
      if (isProgrammaticScroll || activeTween) return;

      const panelIndex = getNearestPanelIndex(
        scroller.scrollTop,
        panels.map((panel) => panel.offsetTop),
      );

      alignToPanel(createScrollbarHomeScrollState(panelIndex));
    };

    const handleNativeScroll = () => {
      if (isProgrammaticScroll) return;

      ignoreNextScrollEnd = false;
      if (navigationStateRef.current.phase === HOME_SCROLL_PHASES.TITLE) {
        commitNavigationState(
          createScrollbarHomeScrollState(
            navigationStateRef.current.panelIndex,
            { settled: false },
          ),
        );
      }

      if (!supportsScrollEnd) {
        window.clearTimeout(scrollSettleTimer);
        scrollSettleTimer = window.setTimeout(
          settleNativeScroll,
          SCROLL_SETTLE_DELAY_MS,
        );
      }
    };

    const handleScrollEnd = () => {
      if (ignoreNextScrollEnd) {
        ignoreNextScrollEnd = false;
        return;
      }

      settleNativeScroll();
    };

    const handleResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        activeTween?.kill();
        activeTween = undefined;
        isProgrammaticScroll = true;
        ignoreNextScrollEnd = supportsScrollEnd;
        const activePanel = panels[navigationStateRef.current.panelIndex];
        scroller.scrollTop = activePanel?.offsetTop ?? 0;
        window.requestAnimationFrame(() => {
          isProgrammaticScroll = false;
        });
      });
    };

    isProgrammaticScroll = true;
    ignoreNextScrollEnd = supportsScrollEnd;
    scroller.scrollTop =
      panels[navigationStateRef.current.panelIndex]?.offsetTop ?? 0;
    resizeFrame = window.requestAnimationFrame(() => {
      isProgrammaticScroll = false;
    });
    scroller.addEventListener("wheel", handleWheel, { passive: false });
    scroller.addEventListener("pointerdown", handlePointerDown);
    scroller.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    scroller.addEventListener("pointerup", clearTouchGesture);
    scroller.addEventListener("pointercancel", clearTouchGesture);
    scroller.addEventListener("keydown", handleKeyDown);
    scroller.addEventListener("scroll", handleNativeScroll, { passive: true });
    if (supportsScrollEnd) {
      scroller.addEventListener("scrollend", handleScrollEnd);
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(scrollSettleTimer);
      window.clearTimeout(wheelIdleTimer);
      activeTween?.kill();
      scroller.removeEventListener("wheel", handleWheel);
      scroller.removeEventListener("pointerdown", handlePointerDown);
      scroller.removeEventListener("pointermove", handlePointerMove);
      scroller.removeEventListener("pointerup", clearTouchGesture);
      scroller.removeEventListener("pointercancel", clearTouchGesture);
      scroller.removeEventListener("keydown", handleKeyDown);
      scroller.removeEventListener("scroll", handleNativeScroll);
      if (supportsScrollEnd) {
        scroller.removeEventListener("scrollend", handleScrollEnd);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [initialScrollReady, phase, reduceMotion]);

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
          className={`dark relative h-dvh shrink-0 touch-pan-x overflow-x-hidden overscroll-y-contain bg-[var(--color-neutral-950-uniform)] [scrollbar-gutter:stable] ${
            initialScrollReady ? "overflow-y-auto" : "overflow-y-hidden"
          }`}
          aria-hidden={phase !== "complete"}
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

          <HomeScrollPanel
            image={homeHeroAsset}
            imageAlt="Instalaciones industriales de ARCA Studio junto al mar"
            title="Arquitectura"
            onTitleRevealComplete={() => setInitialScrollReady(true)}
            titleVisible={
              phase === "complete" &&
              navigationState.panelIndex === 0 &&
              navigationState.phase === HOME_SCROLL_PHASES.TITLE
            }
          />
          <HomeScrollPanel
            image={constructionHeroAsset}
            imageAlt="Baño construido por ARCA Studio con iluminación integrada"
            title="Construcción"
            titleVisible={
              phase === "complete" &&
              navigationState.panelIndex === 1 &&
              navigationState.phase === HOME_SCROLL_PHASES.TITLE
            }
          />
          <HomeScrollPanel
            image={interiorDesignHeroAsset}
            imageAlt="Sala interior diseñada por ARCA Studio con iluminación ambiental"
            title="Interiorismo"
            titleVisible={
              phase === "complete" &&
              navigationState.panelIndex === 2 &&
              navigationState.phase === HOME_SCROLL_PHASES.TITLE
            }
          />
        </main>
      </Motion.div>
    </div>
  );
}

export default OpeningHome;
