import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useMotionValue } from "motion/react";

import { createHomeStatementController } from "./homeScroll/createHomeStatementController.js";
import {
  SECTION_NAVIGATION_DURATION_SECONDS,
  SECTION_NAVIGATION_EASE,
} from "../../utils/sectionNavigationMotion.js";
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

const SCROLL_STEP_DURATION_SECONDS = SECTION_NAVIGATION_DURATION_SECONDS;
const WHEEL_GESTURE_THRESHOLD_PX = 32;
const WHEEL_GESTURE_IDLE_MS = 180;
const SCROLL_SETTLE_DELAY_MS = 180;
const TOUCH_SWIPE_THRESHOLD_PX = 48;
const TOUCH_VERTICAL_DOMINANCE = 1.2;
const STATEMENT_PANEL_INDEX = 3;
const FEATURED_PROJECT_SELECTOR = "[data-featured-project-panel]";
const FEATURED_PROJECT_EDGE_TOLERANCE_PX = 2;
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
  const [activeSectionId, setActiveSectionId] = useState(null);
  const activeSectionRef = useRef(null);
  const [featuredStep, setFeaturedStep] = useState(1);
  const [revealedSectionId, setRevealedSectionId] = useState(null);
  const [activeFeaturedProjectIndex, setActiveFeaturedProjectIndex] = useState(0);
  const activeFeaturedProjectIndexRef = useRef(0);
  const sectionTitleLockedRef = useRef(false);
  const revealedSectionRef = useRef(null);
  const completeSectionTitleReveal = useCallback((sectionId) => {
    if (sectionId === activeSectionRef.current) sectionTitleLockedRef.current = false;
  }, []);
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
        ease: SECTION_NAVIGATION_EASE,
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
    const commitFeaturedProjectIndex = (index) => {
      if (activeFeaturedProjectIndexRef.current === index) return;
      activeFeaturedProjectIndexRef.current = index;
      setActiveFeaturedProjectIndex(index);
    };
    const getFeaturedProjectPanels = (section = getSection("featured-projects")) =>
      section ? [...section.querySelectorAll(FEATURED_PROJECT_SELECTOR)] : [];
    const getElementScrollTop = (element) => {
      const viewportRect = scroller.getBoundingClientRect();
      return scroller.scrollTop + element.getBoundingClientRect().top - viewportRect.top;
    };
    const getFeaturedProjectTransition = (direction, travelDistance = 0) => {
      if (activeSectionRef.current !== "featured-projects" || !direction) return null;
      const projectPanels = getFeaturedProjectPanels();
      const currentIndex = activeFeaturedProjectIndexRef.current;
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= projectPanels.length) return null;

      const viewportRect = scroller.getBoundingClientRect();
      const currentRect = projectPanels[currentIndex].getBoundingClientRect();
      const projectedDistance = Math.max(0, direction * travelDistance);
      const reachedEdge = direction > 0
        ? currentRect.bottom <= viewportRect.bottom +
          FEATURED_PROJECT_EDGE_TOLERANCE_PX + projectedDistance
        : currentRect.top >= viewportRect.top -
          FEATURED_PROJECT_EDGE_TOLERANCE_PX - projectedDistance;
      if (!reachedEdge) return null;

      const nextPanel = projectPanels[nextIndex];
      const nextPanelTop = getElementScrollTop(nextPanel);
      return {
        index: nextIndex,
        scrollTop: direction > 0
          ? nextPanelTop
          : nextPanelTop + Math.max(0, nextPanel.offsetHeight - scroller.clientHeight),
      };
    };
    const synchronizeFeaturedProject = (section = getSection("featured-projects")) => {
      const projectPanels = getFeaturedProjectPanels(section);
      if (!projectPanels.length) return;
      const viewportRect = scroller.getBoundingClientRect();
      let visibleIndex = activeFeaturedProjectIndexRef.current;
      let hasVisiblePanel = false;

      projectPanels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        if (
          rect.top <= viewportRect.top + FEATURED_PROJECT_EDGE_TOLERANCE_PX &&
          rect.bottom > viewportRect.top + FEATURED_PROJECT_EDGE_TOLERANCE_PX
        ) {
          visibleIndex = index;
          hasVisiblePanel = true;
        }
      });
      if (hasVisiblePanel) commitFeaturedProjectIndex(visibleIndex);
    };
    const transitionFeaturedProject = (direction, travelDistance = 0) => {
  if (activeTween || isProgrammaticScroll) return false;

  const transition = getFeaturedProjectTransition(
    direction,
    travelDistance,
  );

  if (!transition) return false;

  isProgrammaticScroll = true;
  ignoreNextScrollEnd = supportsScrollEnd;

  // Activar el proyecto que está entrando ANTES de comenzar el tween.
  // Así su reveal ocurre mientras entra al viewport y no después.
  commitFeaturedProjectIndex(transition.index);

  const completeTransition = () => {
  activeTween = undefined;
  isProgrammaticScroll = false;

  window.clearTimeout(wheelIdleTimer);
  wheelGestureState = createWheelGestureState();
  wheelTransitionLock = false;

  synchronizeContentScroll();
};

  if (reduceMotion) {
    scroller.scrollTop = transition.scrollTop;
    window.requestAnimationFrame(completeTransition);
    return true;
  }

  activeTween = gsap.to(scroller, {
    scrollTo: {
      y: transition.scrollTop,
      autoKill: false,
    },
    duration: SCROLL_STEP_DURATION_SECONDS,
    ease: SECTION_NAVIGATION_EASE,
    overwrite: true,
    onComplete: completeTransition,
  });

  return true;
};
    const selectSection = (id) => {
      if (id !== "featured-projects") commitFeaturedProjectIndex(0);
      if (activeSectionRef.current === id) return;
      activeSectionRef.current = id;
      setActiveSectionId(id);
      // Habilitar el título de la sección que se acaba de alcanzar. El componente
      // espera su entrada real al viewport antes de iniciar el revelado.
      revealedSectionRef.current = id;
      setRevealedSectionId(id);
      sectionTitleLockedRef.current = Boolean(id);
      // El gesto de llegada no puede revelar también el encabezado.
      wheelTransitionLock = true;
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_IDLE_MS);
    };
    const navigateSection = (sectionId, { direct = false } = {}) => {
      const currentState = navigationStateRef.current;
      const currentSectionComplete = contentMode
        ? true
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
      setContentMode(false);

      if (sectionId === "featured-projects") commitFeaturedProjectIndex(0);
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
          if (sectionId !== "home") synchronizeContentScroll();
        });
        return;
      }
      activeTween = gsap.to(scroller, {
        scrollTo: { y: target.offsetTop, autoKill: false },
        duration: reduceMotion ? 0 : SCROLL_STEP_DURATION_SECONDS,
        ease: SECTION_NAVIGATION_EASE,
        overwrite: true,
        onComplete: () => {
          activeTween = undefined;
          isProgrammaticScroll = false;
          setContentMode(sectionId !== "home");
          if (sectionId !== "home") synchronizeContentScroll();
        },
      });
    };
    sectionNavigationRef.current = (sectionId) => navigateSection(sectionId, { direct: true });

    const synchronizeContentScroll = () => {
      const servicesTop = getSection("services")?.offsetTop;
      // Al cruzar el inicio de Servicios hacia arriba, recuperar la transición
      // completa al video antes de permitir nuevamente sus gestos internos.
      if (servicesTop !== undefined && scroller.scrollTop < servicesTop - 1) {
        setContentMode(false);
        selectSection(null);
        resetWheelGesture();
        statementEnteringUp = true;
        alignToPanel(createHomeScrollState({ panelIndex: STATEMENT_PANEL_INDEX, phase: HOME_SCROLL_PHASES.IMAGE }));
        return;
      }
      const featured = getSection("featured-projects");
      const featuredIsActive = Boolean(
        featured && scroller.scrollTop + 64 >= featured.offsetTop,
      );
      selectSection(featuredIsActive ? "featured-projects" : "services");
      if (featuredIsActive) synchronizeFeaturedProject(featured);
      const gallery = featured?.querySelector?.("[data-featured-gallery]");
      // offsetTop cambia segÃºn el offsetParent y no representa necesariamente el
      // borde visible del scroller. La galerÃ­a se revela al entrar de verdad en pantalla.
      if (gallery && gallery.getBoundingClientRect().top < scroller.getBoundingClientRect().bottom) {
        setFeaturedStep((currentStep) => (currentStep === 2 ? currentStep : 2));
      }
    };

    const revealSectionTitle = () => {
      const id = activeSectionRef.current;
      if (!id || sectionTitleLockedRef.current || revealedSectionRef.current === id) return;
      revealedSectionRef.current = id;
      sectionTitleLockedRef.current = true;
      setRevealedSectionId(id);
    };

    const handleWheel = (event) => {
      if (event.ctrlKey) return;
      if (activeTween || isProgrammaticScroll) {
        event.preventDefault();
        event.stopPropagation?.();
        wheelTransitionLock = true;
        window.clearTimeout(wheelIdleTimer);
        wheelIdleTimer = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_IDLE_MS);
        return;
      }
      const delta = normalizeWheelDelta(event, scroller.clientHeight);
      if (Math.abs(delta.y) <= Math.abs(delta.x)) return;

      if (contentMode) {
        if (reduceMotion) return;
        const contentReady =
          revealedSectionRef.current === activeSectionRef.current &&
          !sectionTitleLockedRef.current &&
          !wheelTransitionLock;
        if (contentReady) {
          const direction = Math.sign(delta.y);
                const transition = getFeaturedProjectTransition(
        direction,
        delta.y,
      );

      if (!transition) {
        return;
      }

          event.preventDefault();
          window.clearTimeout(wheelIdleTimer);
          wheelIdleTimer = window.setTimeout(
            resetWheelGesture,
            WHEEL_GESTURE_IDLE_MS,
          );
          wheelGestureState = advanceWheelGesture(
            wheelGestureState,
            delta.y,
            WHEEL_GESTURE_THRESHOLD_PX,
            event.timeStamp,
          );
          if (wheelGestureState.triggeredDirection !== null) {
            transitionFeaturedProject(
              wheelGestureState.triggeredDirection,
              delta.y,
            );
          }
          return;
        }
        event.preventDefault();
        event.stopPropagation?.();
        window.clearTimeout(wheelIdleTimer);
        wheelIdleTimer = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_IDLE_MS);
        if (wheelTransitionLock || sectionTitleLockedRef.current) return;
        wheelGestureState = advanceWheelGesture(wheelGestureState, delta.y, WHEEL_GESTURE_THRESHOLD_PX, event.timeStamp);
        if (wheelGestureState.triggeredDirection !== null) revealSectionTitle();
        return;
      }

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
      touchGesture = null;
      const featuredProjectReady =
        contentMode &&
        activeSectionRef.current === "featured-projects" &&
        revealedSectionRef.current === "featured-projects" &&
        !sectionTitleLockedRef.current &&
        !reduceMotion;
      if (featuredProjectReady && event.pointerType === "touch" && event.isPrimary) {
        touchGesture = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          featuredProject: true,
          consumed: false,
        };
        return;
      }
      if (contentMode && (reduceMotion || revealedSectionRef.current === activeSectionRef.current)) return;
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
      if (
        !touchGesture ||
        touchGesture.pointerId !== event.pointerId ||
        touchGesture.consumed
      ) {
        return;
      }

      const horizontalDistance = event.clientX - touchGesture.startX;
      const verticalDistance = touchGesture.startY - event.clientY;
      if (touchGesture.featuredProject) {
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
        if (!getFeaturedProjectTransition(direction, verticalDistance)) {
          touchGesture = null;
          return;
        }

        event.preventDefault();
        touchGesture.consumed = true;
        transitionFeaturedProject(direction, verticalDistance);
        return;
      }
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
      if (contentMode) {
        event.stopPropagation?.();
        revealSectionTitle();
        return;
      }
      moveByDirection(direction);
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
        const contentReady =
          revealedSectionRef.current === activeSectionRef.current &&
          !sectionTitleLockedRef.current;
        if (contentReady) {
          const keyboardTravelDistance =
            event.key === "PageDown" || event.key === "PageUp" || event.key === " "
              ? direction * scroller.clientHeight
              : direction * 40;
          if (
            activeSectionRef.current === "featured-projects" &&
            getFeaturedProjectTransition(direction, keyboardTravelDistance)
          ) {
            event.preventDefault();
            if (!event.repeat) {
              transitionFeaturedProject(direction, keyboardTravelDistance);
            }
          }
          return;
        }
        if (reduceMotion) return;
        event.preventDefault();
        event.stopPropagation?.();
        if (!event.repeat) revealSectionTitle();
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
      if (contentMode) {
        synchronizeContentScroll();
        return;
      }
      const statementTop = panels[STATEMENT_PANEL_INDEX]?.offsetTop ?? 0;
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
        // Los paneles introductorios cambian de altura con el viewport. Un resize
        // no debe interpretarse como un gesto de regreso al video.
        const servicesTop = getSection("services")?.offsetTop;
        if (servicesTop !== undefined && scroller.scrollTop < servicesTop) {
          scroller.scrollTop = servicesTop;
        }
        synchronizeContentScroll();
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
    scroller.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    scroller.addEventListener("pointerdown", handlePointerDown, true);
    scroller.addEventListener("pointermove", handlePointerMove, {
      passive: false,
      capture: true,
    });
    scroller.addEventListener("pointerup", clearTouchGesture);
    scroller.addEventListener("pointercancel", clearTouchGesture);
    scroller.addEventListener("keydown", handleKeyDown);
    scroller.addEventListener("scroll", handleNativeScroll, { passive: true });
    if (supportsScrollEnd) scroller.addEventListener("scrollend", handleScrollEnd);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      sectionNavigationRef.current = null;
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(scrollSettleTimer);
      window.clearTimeout(wheelIdleTimer);
      activeTween?.kill();
      titleRevealLockedRef.current = false;
      statement.destroy();
      scroller.removeEventListener("wheel", handleWheel, true);
      scroller.removeEventListener("pointerdown", handlePointerDown, true);
      scroller.removeEventListener("pointermove", handlePointerMove, true);
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
    activeFeaturedProjectIndex,
    activeSectionId,
    revealedSectionId,
    completeSectionTitleReveal,
    featuredStep,
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
