import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useMotionValue } from "motion/react";

import { createHomeStatementController } from "./homeScroll/createHomeStatementController.js";
import { createServicesProgress, advanceServicesProgress, completeServicesReveal, canLeaveServices } from "../../services/utils/servicesProgress.js";
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
  getSequentialScrollbarPanelIndex,
  getSwipeDirection,
  limitHomeStatementWheelDelta,
  normalizeWheelDelta,
} from "../utils/homeScrollNavigation.js";

const SCROLL_STEP_DURATION_SECONDS = 0.5;
const WHEEL_GESTURE_THRESHOLD_PX = 32;
const WHEEL_GESTURE_IDLE_MS = 180;
const SCROLL_SETTLE_DELAY_MS = 180;
const TOUCH_SWIPE_THRESHOLD_PX = 48;
const TOUCH_VERTICAL_DOMINANCE = 1.2;
const STATEMENT_PANEL_INDEX = 3;
const INITIAL_NAVIGATION_STATE = createHomeScrollState();

gsap.registerPlugin(ScrollToPlugin);

function isInteractiveTarget(target) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'a, button, input, select, textarea, [contenteditable="true"], [role="button"]',
      ),
    )
  );
}

function useHomeScrollController({ enabled, initialScrollReady, reduceMotion }) {
  const [navigationState, setNavigationState] = useState(
    INITIAL_NAVIGATION_STATE,
  );
  const scrollerRef = useRef(null);
  const navigationStateRef = useRef(INITIAL_NAVIGATION_STATE);
  const titleRevealLockedRef = useRef(false);
  const statementProgress = useMotionValue(0);
  const [contentScrollActive, setContentScrollActive] = useState(false);
  const contentModeRef = useRef(false);
  const [servicesStep, setServicesStep] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const activeSectionRef = useRef(null);
  const [featuredStep, setFeaturedStep] = useState(0);
  const featuredProgressRef = useRef({ step: 0, revealed: true });
  const completeFeaturedReveal = useCallback((visible = true) => {
    if (activeSectionRef.current === "featured-projects" && featuredProgressRef.current.step === (visible ? 1 : 0)) {
      featuredProgressRef.current.revealed = true;
    }
  }, []);
  const servicesProgressRef = useRef(createServicesProgress());
  const completeServicesStep = useCallback((step) => {
    servicesProgressRef.current = completeServicesReveal(servicesProgressRef.current, step);
  }, []);
  const completeServiceCategories = useCallback((complete) => {
    servicesProgressRef.current = { ...servicesProgressRef.current, categoriesComplete: complete };
  }, []);
  const servicesBackRef = useRef(null);
  const retreatFromServices = useCallback(() => servicesBackRef.current?.(), []);
  const servicesExitRef = useRef(null);
  const advanceFromServices = useCallback(() => servicesExitRef.current?.(), []);
  const sectionNavigationRef = useRef(null);
  const navigateToSection = useCallback((sectionId) => {
    sectionNavigationRef.current?.(sectionId);
  }, []);

  const completeTitleReveal = useCallback((panelIndex) => {
    if (panelIndex === navigationStateRef.current.panelIndex) titleRevealLockedRef.current = false;
  }, []);

  useLayoutEffect(() => {
    if (!initialScrollReady && scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
    }
  }, [initialScrollReady]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!enabled || !scroller) return undefined;

    const panels = gsap.utils.toArray("[data-home-panel]", scroller);
    let activeTween;
    let statementEnteringUp = false;
    let contentEnteringUp = false;
    let resizeFrame;
    let scrollSettleTimer;
    let wheelTransitionLock = false;
    let wheelIdleTimer;
    let wheelGestureState = createWheelGestureState();
    let touchGesture = null;
    let isProgrammaticScroll = false;
    let ignoreNextScrollEnd = false;
    let nativeScrollOriginState = null;
    let contentMode = contentModeRef.current;
    let currentServicesStep = servicesProgressRef.current.step;
    const changeServicesStep = (step) => {
      currentServicesStep = step;
      setServicesStep(step);
    };
    const supportsScrollEnd = "onscrollend" in scroller;

    const commitNavigationState = (nextState) => {
      navigationStateRef.current = nextState;
      setNavigationState(nextState);
    };
    const statement = createHomeStatementController({
      commitNavigationState,
      getNavigationState: () => navigationStateRef.current,
      getViewportHeight: () => scroller.clientHeight,
      isPanelTransitioning: () => Boolean(activeTween),
      panelIndex: STATEMENT_PANEL_INDEX,
      progress: statementProgress,
      reduceMotion,
    });

    const alignToPanel = (nextState) => {
      if (activeTween) return false;

      const currentState = navigationStateRef.current;
      const panelChanged = nextState.panelIndex !== currentState.panelIndex;
      const targetPanel = panels[nextState.panelIndex];
      const targetScrollTop = targetPanel?.offsetTop ?? 0;
      const needsAlignment = Math.abs(scroller.scrollTop - targetScrollTop) > 1;

      statement.synchronizeWithNavigation(nextState, currentState);
      if (
        nextState.panelIndex < STATEMENT_PANEL_INDEX &&
        nextState.phase === HOME_SCROLL_PHASES.TITLE &&
        (currentState.panelIndex !== nextState.panelIndex ||
          currentState.phase !== HOME_SCROLL_PHASES.TITLE)
      ) {
        titleRevealLockedRef.current = true;
      }
      commitNavigationState(nextState);
      if (panelChanged) wheelTransitionLock = true;
      if (!panelChanged && !needsAlignment) return true;

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
      if (activeTween || titleRevealLockedRef.current) return false;
      const currentState = navigationStateRef.current;
      const leavesStatementStart =
        currentState.panelIndex === STATEMENT_PANEL_INDEX &&
        direction === HOME_SCROLL_DIRECTIONS.UP &&
        statement.getProgress() <= 0;
      const nextState = getNextHomeScrollState(
        currentState,
        direction,
        panels.length,
        { skipCurrentImageReveal: leavesStatementStart },
      );
      return nextState === currentState ? false : alignToPanel(nextState);
    };

    const resetWheelGesture = () => {
      wheelGestureState = createWheelGestureState();
      statement.resetWheelScrubbing();
      wheelTransitionLock = false;
    };

    const setContentMode = (value) => {
      contentMode = value;
      contentModeRef.current = value;
      setContentScrollActive(value);
      window.clearTimeout(scrollSettleTimer);
      nativeScrollOriginState = null;
    };

    const getSection = (id) => [...scroller.querySelectorAll("section[id]")].find((section) => section.id === id);
    const servicesEnd = () => {
      const next = getSection("featured-projects");
      return next ? Math.max(getSection("services")?.offsetTop ?? 0, next.offsetTop - scroller.clientHeight) : Infinity;
    };
    const isFeatured = () => contentMode && activeSectionRef.current === "featured-projects";
    const servicesAtEnd = () => scroller.scrollTop >= servicesEnd() - 1;
    const selectSection = (id) => {
      activeSectionRef.current = id;
      setActiveSectionId(id);
    };
    const navigateSection = (sectionId, { direct = false } = {}) => {
      const currentState = navigationStateRef.current;
      const currentSectionComplete = contentMode
        ? (isFeatured() ? featuredProgressRef.current.revealed : canLeaveServices(servicesProgressRef.current))
        : !titleRevealLockedRef.current && currentState.phase === HOME_SCROLL_PHASES.TITLE &&
          (currentState.panelIndex !== STATEMENT_PANEL_INDEX || statement.getProgress() >= 1);
      if (!direct && (activeTween || isProgrammaticScroll || !currentSectionComplete)) return;
      const target = sectionId === "home" ? panels[0] :
        [...scroller.querySelectorAll("section[id]")].find((section) => section.id === sectionId);
      if (!target) return;
      activeTween?.kill();
      activeTween = undefined;
      statement.stopAnimation();
      statement.resetWheelScrubbing();
      wheelTransitionLock = false;
      titleRevealLockedRef.current = false;
      contentEnteringUp = isFeatured() && sectionId === "services";
      setContentMode(false);
      if (sectionId === "home" || sectionId === "services") {
        changeServicesStep(0);
        servicesProgressRef.current = createServicesProgress();
      }
      featuredProgressRef.current = { step: 0, revealed: true };
      setFeaturedStep(0);
      selectSection(sectionId === "home" ? null : sectionId);
      commitNavigationState(createScrollbarHomeScrollState(
        sectionId === "home" ? 0 : STATEMENT_PANEL_INDEX,
      ));
      statementEnteringUp = false;
      statement.commitProgress(0);
      isProgrammaticScroll = true;
      ignoreNextScrollEnd = supportsScrollEnd;
      if (reduceMotion) {
        scroller.scrollTop = target.offsetTop;
        window.requestAnimationFrame(() => {
          isProgrammaticScroll = false;
          setContentMode(sectionId !== "home");
        });
        return;
      }
      activeTween = gsap.to(scroller, {
        scrollTo: { y: target.offsetTop, autoKill: false },
        duration: reduceMotion ? 0 : SCROLL_STEP_DURATION_SECONDS,
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => {
          activeTween = undefined;
          isProgrammaticScroll = false;
          setContentMode(sectionId !== "home");
        },
      });
    };
    servicesExitRef.current = () => {
      if (contentMode && activeSectionRef.current === "services") navigateSection("featured-projects");
    };
    sectionNavigationRef.current = (sectionId) => navigateSection(sectionId, { direct: true });

    const advanceServices = () => {
      // Igual que en los paneles de imagen: cualquier dirección completa
      // primero el contenido pendiente antes de permitir abandonar la sección.
      const next = advanceServicesProgress(servicesProgressRef.current);
      if (next === servicesProgressRef.current) return;
      servicesProgressRef.current = next;
      changeServicesStep(next.step);
      if (next.step === 2) contentEnteringUp = false;
    };

    const advanceContent = (direction) => {
      if (activeTween || isProgrammaticScroll) return;
      if (isFeatured()) {
        const progress = featuredProgressRef.current;
        if (!progress.revealed) return;
        if (direction === HOME_SCROLL_DIRECTIONS.UP && progress.step === 0) {
          navigateSection("services");
        } else {
          const step = direction === HOME_SCROLL_DIRECTIONS.UP ? 0 : 1;
          if (step === progress.step) return;
          featuredProgressRef.current = { step, revealed: false };
          setFeaturedStep(step);
        }
      } else if (contentEnteringUp && currentServicesStep < 2) {
        advanceServices();
      } else if (direction === HOME_SCROLL_DIRECTIONS.UP) {
        if (!servicesProgressRef.current.revealed) return;
        if (currentServicesStep === 0) {
          setContentMode(false);
          selectSection(null);
          resetWheelGesture();
          statementEnteringUp = true;
          alignToPanel(createHomeScrollState({ panelIndex: STATEMENT_PANEL_INDEX, phase: HOME_SCROLL_PHASES.IMAGE }));
          return;
        }
        servicesProgressRef.current = { ...servicesProgressRef.current, step: currentServicesStep - 1, revealed: false };
        changeServicesStep(currentServicesStep - 1);
        const top = getSection("services")?.offsetTop ?? 0;
        if (scroller.scrollTop > top + 1) {
          isProgrammaticScroll = true;
          activeTween = gsap.to(scroller, {
            scrollTo: { y: top, autoKill: false }, duration: reduceMotion ? 0 : SCROLL_STEP_DURATION_SECONDS,
            ease: "power2.inOut", onComplete: () => { activeTween = undefined; isProgrammaticScroll = false; },
          });
        }
      } else if (currentServicesStep < 2) {
        advanceServices();
      } else if (servicesAtEnd()) {
        navigateSection("featured-projects");
      }
    };
    servicesBackRef.current = () => {
      if (contentMode && activeSectionRef.current === "services") advanceContent(HOME_SCROLL_DIRECTIONS.UP);
    };

    const handleWheel = (event) => {
      if (event.ctrlKey) return;
      if (activeTween || isProgrammaticScroll) {
        event.preventDefault();
        return;
      }
      if (contentMode && !isFeatured() && currentServicesStep === 2 && servicesProgressRef.current.revealed && !(servicesAtEnd() && event.deltaY > 0) && !(event.deltaY < 0 && scroller.scrollTop <= (getSection("services")?.offsetTop ?? 0) + 1)) return;
      const delta = normalizeWheelDelta(event, scroller.clientHeight);
      if (Math.abs(delta.y) <= Math.abs(delta.x)) return;

      event.preventDefault();
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(
        resetWheelGesture,
        WHEEL_GESTURE_IDLE_MS,
      );
      statement.stopAnimation();
      if (wheelTransitionLock) return;

      const currentState = navigationStateRef.current;
      const isStatementReady =
        !contentMode && currentState.panelIndex === STATEMENT_PANEL_INDEX && !activeTween;
      if (isStatementReady && statement.getProgress() >= 1) statementEnteringUp = false;
      if (isStatementReady && statement.isWheelScrubbing()) {
        statement.queueDelta(limitHomeStatementWheelDelta(statementEnteringUp ? Math.abs(delta.y) : delta.y));
        return;
      }

      wheelGestureState = advanceWheelGesture(
        wheelGestureState,
        delta.y,
        WHEEL_GESTURE_THRESHOLD_PX,
        event.timeStamp,
      );
      if (contentMode) {
        if (wheelGestureState.triggeredDirection !== null) {
          advanceContent(wheelGestureState.triggeredDirection);
        }
        return;
      }
      if (isStatementReady && wheelGestureState.triggeredDirection !== null) {
        const direction = wheelGestureState.triggeredDirection;
        const currentProgress = statement.getProgress();
        if (currentProgress <= 0 && direction === HOME_SCROLL_DIRECTIONS.UP && !statementEnteringUp) {
          moveByDirection(direction);
          return;
        }
        if (currentProgress >= 1 && direction === HOME_SCROLL_DIRECTIONS.DOWN) {
          navigateSection("services");
          return;
        }

        statement.startWheelScrubbing();
        statement.queueDelta(limitHomeStatementWheelDelta(statementEnteringUp ? Math.abs(delta.y) : delta.y));
        return;
      }

      if (!activeTween && wheelGestureState.triggeredDirection !== null) {
        moveByDirection(wheelGestureState.triggeredDirection);
      }
    };

    const handlePointerDown = (event) => {
      if (contentMode && !isFeatured() && currentServicesStep === 2) return;
      if (event.pointerType !== "touch" || !event.isPrimary) return;
      const isStatementGesture =
        !contentMode && navigationStateRef.current.panelIndex === STATEMENT_PANEL_INDEX;

      touchGesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startProgress: isStatementGesture ? statement.getProgress() : 0,
        statement: isStatementGesture,
        captured: false,
        consumed: false,
      };
    };

    const handlePointerMove = (event) => {
      if (contentMode && !isFeatured() && currentServicesStep === 2) return;
      if (
        !touchGesture ||
        touchGesture.pointerId !== event.pointerId ||
        touchGesture.consumed
      ) {
        return;
      }

      const horizontalDistance = event.clientX - touchGesture.startX;
      const verticalDistance = touchGesture.startY - event.clientY;
      if (touchGesture.statement && !activeTween) {
        const absoluteVerticalDistance = Math.abs(verticalDistance);
        const isVerticalGesture =
          absoluteVerticalDistance >=
          Math.abs(horizontalDistance) * TOUCH_VERTICAL_DOMINANCE;
        if (!isVerticalGesture) return;
        if (
          !touchGesture.captured &&
          absoluteVerticalDistance < TOUCH_SWIPE_THRESHOLD_PX
        ) {
          return;
        }

        event.preventDefault();
        touchGesture.captured = true;
        statement.stopAnimation();
        if (
          touchGesture.startProgress <= 0 && !statementEnteringUp &&
          verticalDistance < -TOUCH_SWIPE_THRESHOLD_PX
        ) {
          touchGesture.consumed = true;
          moveByDirection(HOME_SCROLL_DIRECTIONS.UP);
          return;
        }
        if (
          touchGesture.startProgress >= 1 &&
          verticalDistance > TOUCH_SWIPE_THRESHOLD_PX
        ) {
          touchGesture.consumed = true;
          navigateSection("services");
          return;
        }

        statement.commitProgress(
          advanceHomeStatementProgress(
            touchGesture.startProgress,
            statementEnteringUp ? Math.abs(verticalDistance) : verticalDistance,
            scroller.clientHeight,
            reduceMotion,
          ),
        );
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
      if (contentMode) advanceContent(direction);
      else moveByDirection(direction);
    };

    const clearTouchGesture = (event) => {
      if (touchGesture?.pointerId === event.pointerId) touchGesture = null;
    };

    const handleKeyDown = (event) => {
      const direction = getKeyboardDirection(event);
      if (direction === null || isInteractiveTarget(event.target)) return;
      if (activeTween || isProgrammaticScroll) {
        event.preventDefault();
        return;
      }
      if (contentMode) {
        if (!isFeatured() && currentServicesStep === 2 && servicesProgressRef.current.revealed && !(servicesAtEnd() && direction === HOME_SCROLL_DIRECTIONS.DOWN) && !(direction === HOME_SCROLL_DIRECTIONS.UP && scroller.scrollTop <= (getSection("services")?.offsetTop ?? 0) + 1)) return;
        event.preventDefault();
        if (!event.repeat) advanceContent(direction);
        return;
      }

      event.preventDefault();
      if (event.repeat) return;
      const currentState = navigationStateRef.current;
      if (currentState.panelIndex === STATEMENT_PANEL_INDEX && !activeTween) {
        const currentProgress = statement.getProgress();
        if (currentProgress <= 0 && direction === HOME_SCROLL_DIRECTIONS.UP && !statementEnteringUp) {
          moveByDirection(direction);
          return;
        }
        if (currentProgress >= 1 && direction === HOME_SCROLL_DIRECTIONS.DOWN) {
          navigateSection("services");
          return;
        }

        statement.animateTo(statementEnteringUp || direction === HOME_SCROLL_DIRECTIONS.DOWN ? 1 : 0);
        statementEnteringUp = false;
        return;
      }

      moveByDirection(direction);
    };

    const settleNativeScroll = () => {
      window.clearTimeout(scrollSettleTimer);
      if (contentMode) return;
      if (isProgrammaticScroll || activeTween) return;
      const requestedPanelIndex = getNearestPanelIndex(
        scroller.scrollTop,
        panels.map((panel) => panel.offsetTop),
      );
      const originState = nativeScrollOriginState ?? navigationStateRef.current;
      const panelIndex =
        titleRevealLockedRef.current ||
        originState.phase !== HOME_SCROLL_PHASES.TITLE
          ? originState.panelIndex
          : getSequentialScrollbarPanelIndex(
              originState.panelIndex,
              requestedPanelIndex,
              panels.length,
            );

      nativeScrollOriginState = null;
      alignToPanel(createScrollbarHomeScrollState(panelIndex));
    };

    const handleNativeScroll = () => {
      if (isProgrammaticScroll) return;
      if (isFeatured()) {
        const top = getSection("featured-projects")?.offsetTop ?? 0;
        const returning = scroller.scrollTop < top - 1;
        scroller.scrollTop = top;
        if (returning) advanceContent(HOME_SCROLL_DIRECTIONS.UP);
        return;
      }
      if (contentMode && currentServicesStep === 2 && servicesProgressRef.current.revealed && scroller.scrollTop > servicesEnd() + 1) {
        scroller.scrollTop = servicesEnd();
        if (canLeaveServices(servicesProgressRef.current)) navigateSection("featured-projects");
        return;
      }
      if (contentMode && (currentServicesStep < 2 || !servicesProgressRef.current.revealed)) {
        const services = [...scroller.querySelectorAll("section[id]")]
          .find((section) => section.id === "services");
        if (services) scroller.scrollTop = services.offsetTop;
        return;
      }
      const statementTop = panels[STATEMENT_PANEL_INDEX]?.offsetTop ?? 0;
      const servicesTop = [...scroller.querySelectorAll("section[id]")]
        .find((section) => section.id === "services")?.offsetTop;
      if (contentMode && servicesTop !== undefined && scroller.scrollTop < servicesTop - 1) {
        scroller.scrollTop = servicesTop;
        advanceContent(HOME_SCROLL_DIRECTIONS.UP);
        return;
      }
      if (scroller.scrollTop > statementTop + 1) {
        if (!contentMode) {
          const currentState = navigationStateRef.current;
          if (currentState.panelIndex === STATEMENT_PANEL_INDEX &&
              currentState.phase === HOME_SCROLL_PHASES.TITLE && statement.getProgress() >= 1) {
            navigateSection("services");
          } else {
            scroller.scrollTop = panels[currentState.panelIndex]?.offsetTop ?? 0;
          }
        }
        return;
      }
      if (contentMode) {
        setContentMode(false);
        selectSection(null);
        resetWheelGesture();
        statementEnteringUp = true;
          alignToPanel(createHomeScrollState(STATEMENT_PANEL_INDEX, HOME_SCROLL_PHASES.IMAGE));
        return;
      }
      ignoreNextScrollEnd = false;
      const currentState = navigationStateRef.current;
      nativeScrollOriginState ??= currentState;
      if (currentState.panelIndex === STATEMENT_PANEL_INDEX) {
        statement.resetForNativeScroll();
      } else if (currentState.phase === HOME_SCROLL_PHASES.TITLE) {
        commitNavigationState(
          createScrollbarHomeScrollState(currentState.panelIndex, {
            settled: false,
          }),
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
      if (contentMode) {
        const section = getSection(activeSectionRef.current);
        if (section) scroller.scrollTop = isFeatured() || currentServicesStep < 2
          ? section.offsetTop : Math.min(Math.max(scroller.scrollTop, section.offsetTop), servicesEnd());
        return;
      }
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
    if (!contentMode) {
      scroller.scrollTop = panels[navigationStateRef.current.panelIndex]?.offsetTop ?? 0;
    }
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
    if (supportsScrollEnd) scroller.addEventListener("scrollend", handleScrollEnd);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      servicesBackRef.current = null;
      servicesExitRef.current = null;
      sectionNavigationRef.current = null;
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(scrollSettleTimer);
      window.clearTimeout(wheelIdleTimer);
      activeTween?.kill();
      titleRevealLockedRef.current = false;
      statement.destroy();
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
  }, [enabled, reduceMotion, statementProgress]);

  return {
    retreatFromServices,
    advanceFromServices,
    activeSectionId,
    featuredStep,
    completeFeaturedReveal,
    completeServicesStep,
    completeServiceCategories,
    servicesStep,
    contentScrollActive,
    navigateToSection,
    completeTitleReveal,
    navigationState,
    scrollerRef,
    statementPanelIndex: STATEMENT_PANEL_INDEX,
    statementProgress,
  };
}

export {
  SCROLL_STEP_DURATION_SECONDS,
  SCROLL_SETTLE_DELAY_MS,
  STATEMENT_PANEL_INDEX,
  TOUCH_SWIPE_THRESHOLD_PX,
  TOUCH_VERTICAL_DOMINANCE,
  WHEEL_GESTURE_IDLE_MS,
  WHEEL_GESTURE_THRESHOLD_PX,
};
export default useHomeScrollController;
