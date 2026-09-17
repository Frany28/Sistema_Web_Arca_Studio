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
  advanceFeaturedExpansionProgress,
  advanceHomeStatementProgress,
  advanceWheelGesture,
  consumeWheelGesture,
  createHomeScrollState,
  createScrollbarHomeScrollState,
  createWheelGestureState,
  getKeyboardDirection,
  getNearestPanelIndex,
  getNextHomeScrollState,
  getSequentialScrollbarPanelIndex,
  getSwipeDirection,
  limitHomeStatementWheelDelta,
  markWheelGestureIdle,
  normalizeWheelDelta,
} from "../utils/homeScrollNavigation.js";

const SCROLL_STEP_DURATION_SECONDS = SECTION_NAVIGATION_DURATION_SECONDS;
const WHEEL_GESTURE_THRESHOLD_PX = 32;
const WHEEL_GESTURE_IDLE_MS = 180;
const SCROLL_SETTLE_DELAY_MS = 180;
const TOUCH_SWIPE_THRESHOLD_PX = 48;
const TOUCH_VERTICAL_DOMINANCE = 1.2;
const WHEEL_VERTICAL_DOMINANCE = 1.2;
const STATEMENT_PANEL_INDEX = 3;
const FEATURED_PROJECT_SELECTOR = "[data-featured-project-panel]";
const FEATURED_IMAGE_GALLERY_SELECTOR = "[data-featured-image-gallery]";
const CONTENT_TITLE_SCOPE_SELECTOR = "[data-content-title-scope]";
const FEATURED_PROJECT_EDGE_TOLERANCE_PX = 2;
const FEATURED_EXPANSION_SMOOTH_MIN_SECONDS = 0.06;
const FEATURED_EXPANSION_SMOOTH_MAX_SECONDS = 0.16;
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

function isVisibleWithinViewport(elementRect, viewportRect) {
  return (
    elementRect.bottom > viewportRect.top &&
    elementRect.top < viewportRect.bottom
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
  const firstFeaturedExpansionProgress = useMotionValue(0);
  const secondFeaturedExpansionProgress = useMotionValue(0);
  const thirdFeaturedExpansionProgress = useMotionValue(0);
  const firstFeaturedPreparationOffset = useMotionValue(0);
  const secondFeaturedPreparationOffset = useMotionValue(0);
  const thirdFeaturedPreparationOffset = useMotionValue(0);
  const featuredProjectExpansionProgressRef = useRef(null);
  if (!featuredProjectExpansionProgressRef.current) {
    featuredProjectExpansionProgressRef.current = [
      firstFeaturedExpansionProgress,
      secondFeaturedExpansionProgress,
      thirdFeaturedExpansionProgress,
    ];
  }
  const featuredProjectExpansionProgress =
    featuredProjectExpansionProgressRef.current;
  const featuredProjectPreparationOffsetsRef = useRef(null);
  if (!featuredProjectPreparationOffsetsRef.current) {
    featuredProjectPreparationOffsetsRef.current = [
      firstFeaturedPreparationOffset,
      secondFeaturedPreparationOffset,
      thirdFeaturedPreparationOffset,
    ];
  }
  const featuredProjectPreparationOffsets =
    featuredProjectPreparationOffsetsRef.current;
  const [contentScrollActive, setContentScrollActive] = useState(false);
  const contentModeRef = useRef(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const activeSectionRef = useRef(null);
  const [featuredStep, setFeaturedStep] = useState(1);
  const [visibleContentTitleIds, setVisibleContentTitleIds] = useState([]);
  const [activeFeaturedProjectIndex, setActiveFeaturedProjectIndex] = useState(0);
  const activeFeaturedProjectIndexRef = useRef(0);
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
    let featuredExpansionCompletionLock = null;
    const featuredExpansionTweens = new Map();
    const featuredExpansionTargets = featuredProjectExpansionProgress.map(
      (progress) => progress.get(),
    );
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
          releaseWheelTransitionLock();
          synchronizeContentTitleVisibility();
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
          releaseWheelTransitionLock();
          synchronizeContentTitleVisibility();
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

    const settleWheelGesture = () => {
      wheelGestureState = markWheelGestureIdle(wheelGestureState);
      statement.resetWheelScrubbing();
      wheelTransitionLock = false;
    };
    const releaseWheelTransitionLock = () => {
      wheelTransitionLock = false;
    };
    const scheduleWheelGestureSettlement = () => {
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(
        settleWheelGesture,
        WHEEL_GESTURE_IDLE_MS,
      );
    };
    const observeConsumedWheelGesture = (deltaY, eventTime) => {
      if (!wheelGestureState.consumed) return;
      const observedGesture = advanceWheelGesture(
        wheelGestureState,
        deltaY,
        WHEEL_GESTURE_THRESHOLD_PX,
        eventTime,
      );
      wheelGestureState = {
        ...observedGesture,
        triggeredDirection: null,
      };
    };

    const setContentMode = (value) => {
      contentMode = value;
      contentModeRef.current = value;
      setContentScrollActive(value);
      window.clearTimeout(scrollSettleTimer);
      nativeScrollOriginState = null;
    };

    const getSection = (id) => [...scroller.querySelectorAll("section[id]")].find((section) => section.id === id);
    const synchronizeContentTitleVisibility = () => {
      const viewportRect = scroller.getBoundingClientRect();
      const nextVisibleIds = [...scroller.querySelectorAll(CONTENT_TITLE_SCOPE_SELECTOR)]
        .filter((element) =>
          isVisibleWithinViewport(element.getBoundingClientRect(), viewportRect),
        )
        .map((element) => element.dataset.contentTitleScope);

      setVisibleContentTitleIds((currentVisibleIds) =>
        currentVisibleIds.length === nextVisibleIds.length &&
        currentVisibleIds.every((id, index) => id === nextVisibleIds[index])
          ? currentVisibleIds
          : nextVisibleIds,
      );
    };
    const commitFeaturedProjectIndex = (index) => {
      if (activeFeaturedProjectIndexRef.current === index) return;
      activeFeaturedProjectIndexRef.current = index;
      setActiveFeaturedProjectIndex(index);
    };
    const getFeaturedProjectPanels = (section = getSection("featured-projects")) =>
      section ? [...section.querySelectorAll(FEATURED_PROJECT_SELECTOR)] : [];
    const isFeaturedImageProject = (index, projectPanels = getFeaturedProjectPanels()) =>
      Boolean(
        projectPanels[index]?.querySelector?.(FEATURED_IMAGE_GALLERY_SELECTOR),
      );
    const getFeaturedExpansionProgress = (index) =>
      featuredProjectExpansionProgress[index]?.get() ?? 0;
    const getFeaturedExpansionTarget = (index) =>
      featuredExpansionTargets[index] ?? 0;
    const setFeaturedExpansionProgress = (index, progress) => {
      featuredExpansionTweens.get(index)?.kill();
      featuredExpansionTweens.delete(index);
      featuredExpansionTargets[index] = progress;
      featuredProjectExpansionProgress[index]?.set(progress);
    };
    const smoothFeaturedExpansionProgress = (index, nextProgress) => {
      const renderedProgress = getFeaturedExpansionProgress(index);
      const targetProgress = Math.min(Math.max(nextProgress, 0), 1);
      const distance = Math.abs(targetProgress - renderedProgress);

      featuredExpansionTargets[index] = targetProgress;
      featuredExpansionTweens.get(index)?.kill();
      featuredExpansionTweens.delete(index);

      if (reduceMotion || distance <= 0.0001) {
        featuredProjectExpansionProgress[index]?.set(targetProgress);
        if (targetProgress >= 1) featuredExpansionCompletionLock = index;
        return;
      }

      const progressProxy = { value: renderedProgress };
      const duration = Math.min(
        FEATURED_EXPANSION_SMOOTH_MAX_SECONDS,
        Math.max(FEATURED_EXPANSION_SMOOTH_MIN_SECONDS, distance * 0.75),
      );
      const tween = gsap.to(progressProxy, {
        value: targetProgress,
        duration,
        ease: "power1.out",
        overwrite: true,
        onUpdate: () => {
          featuredProjectExpansionProgress[index]?.set(
            Math.min(Math.max(progressProxy.value, 0), 1),
          );
        },
        onComplete: () => {
          featuredProjectExpansionProgress[index]?.set(targetProgress);
          if (featuredExpansionTargets[index] === targetProgress) {
            if (targetProgress >= 1) featuredExpansionCompletionLock = index;
            featuredExpansionTweens.delete(index);
          }
        },
      });
      featuredExpansionTweens.set(index, tween);
    };
    const setFeaturedPreparationOffset = (index, offset) => {
      featuredProjectPreparationOffsets[index]?.set(offset);
    };
    const resetFeaturedExpansionProgress = () => {
      featuredExpansionCompletionLock = null;
      featuredProjectExpansionProgress.forEach((_, index) => {
        setFeaturedExpansionProgress(index, 0);
      });
    };
    const resetFeaturedNavigationState = () => {
      resetFeaturedExpansionProgress();
      featuredProjectPreparationOffsets.forEach((_, index) => {
        setFeaturedPreparationOffset(index, 0);
      });
      commitFeaturedProjectIndex(0);
    };
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

      const expansionProgress = getFeaturedExpansionProgress(currentIndex);
      if (
        isFeaturedImageProject(currentIndex, projectPanels) &&
        ((direction > 0 && expansionProgress < 1) ||
          (direction < 0 && expansionProgress > 0))
      ) {
        return null;
      }

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
    const synchronizeFeaturedProject = (
    section = getSection("featured-projects"),
  ) => {
    const projectPanels = getFeaturedProjectPanels(section);
    if (!projectPanels.length) return;

    // Durante una transición controlada, el índice lo administra
    // transitionFeaturedProject. No competir con GSAP.
    if (activeTween || isProgrammaticScroll) return;

    const scrollTop = scroller.scrollTop;
    const viewportHeight = scroller.clientHeight;

    let closestIndex = activeFeaturedProjectIndexRef.current;
    let closestDistance = Number.POSITIVE_INFINITY;

    projectPanels.forEach((panel, index) => {
      const panelTop = getElementScrollTop(panel);
      const panelBottom = panelTop + panel.offsetHeight;

      const panelStart = panelTop;
      const panelEnd = Math.max(
        panelStart,
        panelBottom - viewportHeight,
      );

      // Solo considerar que estamos realmente dentro del recorrido
      // propio de este panel.
      if (
        scrollTop >= panelStart - FEATURED_PROJECT_EDGE_TOLERANCE_PX &&
        scrollTop <= panelEnd + FEATURED_PROJECT_EDGE_TOLERANCE_PX
      ) {
        const distance = Math.abs(scrollTop - panelStart);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    });

    // No cambiar de proyecto simplemente porque otro panel
    // empezó a asomarse en pantalla.
    if (closestDistance !== Number.POSITIVE_INFINITY) {
      commitFeaturedProjectIndex(closestIndex);
    }
     };
      const transitionFeaturedProject = (direction, travelDistance = 0) => {
        if (activeTween || isProgrammaticScroll) return false;

        const transition = getFeaturedProjectTransition(
          direction,
          travelDistance,
        );

      if (!transition) return false;

      featuredExpansionCompletionLock = null;
      isProgrammaticScroll = true;
        ignoreNextScrollEnd = supportsScrollEnd;

        // Al subir, activar primero el proyecto que va a entrar.
        // Así Quinta aparece desde el momento en que comienza a entrar al viewport.
        if (direction < 0) {
          if (isFeaturedImageProject(transition.index)) {
            setFeaturedPreparationOffset(
              transition.index,
              scroller.scrollTop - transition.scrollTop,
            );
            setFeaturedExpansionProgress(transition.index, 1);
          }
          commitFeaturedProjectIndex(transition.index);
        }

        const completeTransition = () => {
          activeTween = undefined;
          isProgrammaticScroll = false;
          releaseWheelTransitionLock();

          // Al bajar, mantener el proyecto anterior activo durante toda
          // su salida y cambiar al siguiente solo al finalizar.
              if (direction > 0) {
                commitFeaturedProjectIndex(transition.index);
              }

              if (direction < 0) {
                setFeaturedPreparationOffset(transition.index, 0);
              }

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

          const transitionBetweenContentSections = (
            targetSectionId,
            {
              featuredProjectIndex = null,
              targetAlignment = "start",
            } = {},
          ) => {
            if (activeTween || isProgrammaticScroll) return false;

            const target = getSection(targetSectionId);
            if (!target) return false;

            const entersQuintaFromServices =
              activeSectionRef.current === "services" &&
              targetSectionId === "featured-projects" &&
              featuredProjectIndex === 0 &&
              targetAlignment === "start";
            const entersAptoFromProcess =
              activeSectionRef.current === "process" &&
              targetSectionId === "featured-projects" &&
              featuredProjectIndex !== null &&
              targetAlignment === "end";

            if (entersQuintaFromServices) {
              setFeaturedExpansionProgress(0, 0);
            }

            isProgrammaticScroll = true;
            ignoreNextScrollEnd = supportsScrollEnd;

            // Al regresar desde Procesos, activamos el último proyecto
            // antes de comenzar la entrada.
            let targetElement = target;

            if (
              targetSectionId === "featured-projects" &&
              featuredProjectIndex !== null
            ) {
              const projectPanels = getFeaturedProjectPanels(target);
              targetElement = projectPanels[featuredProjectIndex] ?? target;
            }

            const targetElementTop = getElementScrollTop(targetElement);
            const targetScrollTop = targetAlignment === "end"
              ? targetElementTop + Math.max(
                0,
                targetElement.offsetHeight - scroller.clientHeight,
              )
              : targetElementTop;

        if (
          targetAlignment === "end" &&
          featuredProjectIndex !== null &&
          isFeaturedImageProject(featuredProjectIndex)
        ) {
          setFeaturedPreparationOffset(
            featuredProjectIndex,
            scroller.scrollTop - targetScrollTop,
          );
          setFeaturedExpansionProgress(featuredProjectIndex, 1);
        }

        if (featuredProjectIndex !== null) {
          commitFeaturedProjectIndex(featuredProjectIndex);
        }

        if (entersAptoFromProcess) {
          selectSection(targetSectionId);
        }

        const completeTransition = () => {
          activeTween = undefined;
          isProgrammaticScroll = false;
          releaseWheelTransitionLock();

          selectSection(targetSectionId);

          if (featuredProjectIndex !== null) {
            setFeaturedPreparationOffset(featuredProjectIndex, 0);
          }

          synchronizeContentScroll();
        };

        if (reduceMotion) {
          scroller.scrollTop = targetScrollTop;
          window.requestAnimationFrame(completeTransition);
          return true;
        }

        activeTween = gsap.to(scroller, {
          scrollTo: {
            y: targetScrollTop,
            autoKill: false,
          },
          duration: SCROLL_STEP_DURATION_SECONDS,
          ease: SECTION_NAVIGATION_EASE,
          overwrite: true,
          onComplete: completeTransition,
        });

        return true;
      };
    const getPanelScrollBounds = (element) => {
      if (!element) return null;

      const panelTop = getElementScrollTop(element);
      const elementRect = element.getBoundingClientRect();
      const panelHeight = element.offsetHeight ??
        Math.max(0, elementRect.bottom - elementRect.top);
      return {
        start: panelTop,
        end: panelTop + Math.max(0, panelHeight - scroller.clientHeight),
      };
    };
    const getFeaturedExpansionAnchor = (
      currentIndex,
      projectPanels = getFeaturedProjectPanels(),
    ) => {
      const currentPanel = projectPanels[currentIndex];
      const bounds = getPanelScrollBounds(currentPanel);

      if (!bounds) return null;

      /*
      * La expansión debe ocurrir completamente dentro del proyecto actual.
      * No calculamos el anchor a partir de la entrada del siguiente panel,
      * porque eso permite que el siguiente proyecto se asome durante
      * la ampliación.
      */
      return bounds.end;
    };
    const logFeaturedExpansionGeometry = (
      phase,
      currentIndex,
      progress,
      bounds,
      expansionAnchor,
      projectPanels,
    ) => {
      if (!window.__ARCA_DEBUG_FEATURED_EXPANSION__) return;

      const currentPanel = projectPanels[currentIndex];
      const nextPanel = projectPanels[currentIndex + 1];
      console.debug("[featured-expansion]", {
        bounds,
        currentIndex,
        currentPanelRect: currentPanel?.getBoundingClientRect(),
        expansionAnchor,
        nextPanelRect: nextPanel?.getBoundingClientRect(),
        phase,
        progress,
        scrollTop: scroller.scrollTop,
        viewportRect: scroller.getBoundingClientRect(),
      });
    };
    const pinFeaturedExpansion = () => {
      if (
        reduceMotion ||
        activeSectionRef.current !== "featured-projects"
      ) {
        return false;
      }

      const projectPanels = getFeaturedProjectPanels();
      const currentIndex = activeFeaturedProjectIndexRef.current;

      if (!isFeaturedImageProject(currentIndex, projectPanels)) {
        return false;
      }

      const expansionAnchor = getFeaturedExpansionAnchor(
        currentIndex,
        projectPanels,
      );
      if (expansionAnchor === null) return false;

      const progress = getFeaturedExpansionProgress(currentIndex);

      const expansionIsRunning = progress > 0 && progress < 1;
      const expansionHasNotStartedAtBoundary =
        progress <= 0 && scroller.scrollTop >= expansionAnchor;
      const contractionHasNotStartedAtBoundary =
        progress >= 1 && scroller.scrollTop <= expansionAnchor;

      const expansionJustCompleted =
        featuredExpansionCompletionLock === currentIndex &&
        progress >= 1;

      if (
        !expansionIsRunning &&
        !expansionHasNotStartedAtBoundary &&
        !contractionHasNotStartedAtBoundary &&
        !expansionJustCompleted
      ) {
        return false;
      }

      /*
      * El viewport permanece en el ancla mientras la imagen se amplía
      * o se contrae. Tampoco puede cruzarla antes de iniciar el efecto
      * correspondiente en ninguna de las dos direcciones.
      */
      if (
        Math.abs(scroller.scrollTop - expansionAnchor) >
        FEATURED_PROJECT_EDGE_TOLERANCE_PX
      ) {
        scroller.scrollTop = expansionAnchor;
      }

      return true;
    };
    const getContentWheelBoundary = (direction) => {
      if (activeSectionRef.current === "process" && direction < 0) {
        const bounds = getPanelScrollBounds(getSection("process"));
        const projectPanels = getFeaturedProjectPanels();
        const lastProjectIndex = projectPanels.length - 1;
        if (!bounds || lastProjectIndex < 0) return null;

        return {
          scrollTop: bounds.start,
          transition: () => transitionBetweenContentSections(
            "featured-projects",
            {
              featuredProjectIndex: lastProjectIndex,
              targetAlignment: "end",
            },
          ),
        };
      }

      if (activeSectionRef.current !== "featured-projects") return null;

      const projectPanels = getFeaturedProjectPanels();
      const currentIndex = activeFeaturedProjectIndexRef.current;
      const currentPanel = projectPanels[currentIndex];
      const bounds = getPanelScrollBounds(currentPanel);
      if (!bounds) return null;

      const nextIndex = currentIndex + direction;
      if (nextIndex >= 0 && nextIndex < projectPanels.length) {
        return {
          scrollTop: direction > 0 ? bounds.end : bounds.start,
          transition: () => transitionFeaturedProject(direction),
        };
      }

      if (direction < 0 && currentIndex === 0) {
        return {
          scrollTop: bounds.start,
          transition: () => transitionBetweenContentSections(
            "services",
            { targetAlignment: "end" },
          ),
        };
      }

      if (direction > 0 && currentIndex === projectPanels.length - 1) {
        return {
          scrollTop: bounds.end,
          transition: () => transitionBetweenContentSections("process"),
        };
      }

      return null;
    };
    const handleFeaturedExpansionInput = (
      event,
      deltaY,
      direction,
      { smooth = false } = {},
    ) => {
      if (activeSectionRef.current !== "featured-projects") return false;

      const projectPanels = getFeaturedProjectPanels();
      const currentIndex = activeFeaturedProjectIndexRef.current;
      const currentPanel = projectPanels[currentIndex];
      const bounds = getPanelScrollBounds(currentPanel);
      const expansionAnchor = getFeaturedExpansionAnchor(
        currentIndex,
        projectPanels,
      );
      if (
        !bounds ||
        expansionAnchor === null ||
        !isFeaturedImageProject(currentIndex, projectPanels)
      ) {
        return false;
      }

      const progress = getFeaturedExpansionProgress(currentIndex);
      let targetProgress = getFeaturedExpansionTarget(currentIndex);
      if (
        !featuredExpansionTweens.has(currentIndex) &&
        Math.abs(targetProgress - progress) > 0.0001
      ) {
        targetProgress = progress;
        featuredExpansionTargets[currentIndex] = progress;
      }
      if (featuredExpansionCompletionLock === currentIndex) {
        featuredExpansionCompletionLock = null;
        if (direction > 0 && progress >= 1) return false;
      }

      const reversingPendingExpansion =
        (direction > 0 && targetProgress < progress) ||
        (direction < 0 && targetProgress > progress);
      if (reversingPendingExpansion) targetProgress = progress;

      const distanceToEnd = Math.max(0, expansionAnchor - scroller.scrollTop);
      const magnitude = Math.abs(deltaY);
      const reachesEnd =
        distanceToEnd <= magnitude + FEATURED_PROJECT_EDGE_TOLERANCE_PX;
      const isScrubbing = progress > 0 && progress < 1;
      const expands =
        direction > 0 && progress < 1 && (isScrubbing || reachesEnd);
      const contracts =
        direction < 0 &&
        progress > 0 &&
        (isScrubbing ||
          scroller.scrollTop >= expansionAnchor - FEATURED_PROJECT_EDGE_TOLERANCE_PX);

      if (!expands && !contracts) return false;

      logFeaturedExpansionGeometry(
        "wheel-before-pin",
        currentIndex,
        progress,
        bounds,
        expansionAnchor,
        projectPanels,
      );
      event.preventDefault();
      event.stopPropagation?.();

      if (Math.abs(scroller.scrollTop - expansionAnchor) > 0.01) {
        scroller.scrollTop = expansionAnchor;
        synchronizeContentScroll();
      }

      const nativeDistance =
        expands && distanceToEnd > FEATURED_PROJECT_EDGE_TOLERANCE_PX
          ? distanceToEnd
          : 0;
      const scrubDelta = direction * Math.max(0, magnitude - nativeDistance);

      scheduleWheelGestureSettlement();

      let nextProgress = targetProgress;
      if (scrubDelta !== 0) {
        nextProgress = advanceFeaturedExpansionProgress(
          targetProgress,
          scrubDelta,
          scroller.clientHeight,
        );
        if (smooth) {
          smoothFeaturedExpansionProgress(currentIndex, nextProgress);
        } else {
          setFeaturedExpansionProgress(currentIndex, nextProgress);
        }
      }

      if (nextProgress <= 0 || nextProgress >= 1) {
        wheelGestureState = consumeWheelGesture(
          wheelGestureState,
          direction * magnitude,
          event.timeStamp,
        );
      }

      logFeaturedExpansionGeometry(
        "wheel-after-progress",
        currentIndex,
        getFeaturedExpansionProgress(currentIndex),
        bounds,
        expansionAnchor,
        projectPanels,
      );
      if (window.__ARCA_DEBUG_FEATURED_EXPANSION__) {
        window.requestAnimationFrame(() => {
          logFeaturedExpansionGeometry(
            "next-animation-frame",
            currentIndex,
            getFeaturedExpansionProgress(currentIndex),
            bounds,
            expansionAnchor,
            projectPanels,
          );
        });
      }

      return true;
    };
    const handleContentBoundaryWheel = (event, deltaY, direction) => {
      const boundary = getContentWheelBoundary(direction);
      if (!boundary) {
        observeConsumedWheelGesture(deltaY, event.timeStamp);
        scheduleWheelGestureSettlement();
        return false;
      }

      const distanceToBoundary = Math.max(
        0,
        direction * (boundary.scrollTop - scroller.scrollTop),
      );
      const magnitude = Math.abs(deltaY);
      const reachesBoundary =
        distanceToBoundary <= magnitude + FEATURED_PROJECT_EDGE_TOLERANCE_PX;

      if (!reachesBoundary) {
        observeConsumedWheelGesture(deltaY, event.timeStamp);
        scheduleWheelGestureSettlement();
        return false;
      }

      event.preventDefault();
      event.stopPropagation?.();

      if (Math.abs(scroller.scrollTop - boundary.scrollTop) > 0.01) {
        scroller.scrollTop = boundary.scrollTop;
        synchronizeContentScroll();
      }

      const nativeDistance = distanceToBoundary > FEATURED_PROJECT_EDGE_TOLERANCE_PX
        ? distanceToBoundary
        : 0;
      const intentMagnitude = Math.max(0, magnitude - nativeDistance);

      scheduleWheelGestureSettlement();

      if (intentMagnitude > 0) {
        wheelGestureState = advanceWheelGesture(
          wheelGestureState,
          direction * intentMagnitude,
          WHEEL_GESTURE_THRESHOLD_PX,
          event.timeStamp,
        );
      }

      if (
        !wheelTransitionLock &&
        wheelGestureState.triggeredDirection !== null
      ) {
        wheelTransitionLock = true;
        if (!boundary.transition()) wheelTransitionLock = false;
      }

      return true;
    };
    const selectSection = (id) => {
      if (!id || id === "services") commitFeaturedProjectIndex(0);
      if (activeSectionRef.current === id) return;
      activeSectionRef.current = id;
      setActiveSectionId(id);
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
      titleRevealLockedRef.current = false;
      setContentMode(false);

      resetFeaturedNavigationState();
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
          releaseWheelTransitionLock();
          setContentMode(sectionId !== "home");
          if (sectionId !== "home") {
            synchronizeContentScroll();
          } else {
            synchronizeContentTitleVisibility();
          }
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
          releaseWheelTransitionLock();
          setContentMode(sectionId !== "home");
          if (sectionId !== "home") {
            synchronizeContentScroll();
          } else {
            synchronizeContentTitleVisibility();
          }
        },
      });
    };
    sectionNavigationRef.current = (sectionId) => navigateSection(sectionId, { direct: true });

    const synchronizeContentScroll = ({ titlesSynchronized = false } = {}) => {
      if (!titlesSynchronized) synchronizeContentTitleVisibility();
      const servicesTop = getSection("services")?.offsetTop;
      // Al cruzar el inicio de Servicios hacia arriba, recuperar la transición
      // completa al video antes de permitir nuevamente sus gestos internos.
      if (servicesTop !== undefined && scroller.scrollTop < servicesTop - 1) {
        setContentMode(false);
        selectSection(null);
        statementEnteringUp = true;
        alignToPanel(createHomeScrollState({ panelIndex: STATEMENT_PANEL_INDEX, phase: HOME_SCROLL_PHASES.IMAGE }));
        return;
      }
      const featured = getSection("featured-projects");
      const contentSections = [...scroller.querySelectorAll("section[id]")];
      const activeContentSection = contentSections.reduce(
        (currentSection, section) =>
          scroller.scrollTop + 64 >= section.offsetTop
            ? section
            : currentSection,
        contentSections[0],
      );
      const featuredIsActive = activeContentSection?.id === "featured-projects";
      selectSection(activeContentSection?.id ?? "services");
      if (featuredIsActive) synchronizeFeaturedProject(featured);
      const gallery = featured?.querySelector?.("[data-featured-gallery]");
      // offsetTop cambia segÃºn el offsetParent y no representa necesariamente el
      // borde visible del scroller. La galerÃ­a se revela al entrar de verdad en pantalla.
      if (gallery && gallery.getBoundingClientRect().top < scroller.getBoundingClientRect().bottom) {
        setFeaturedStep((currentStep) => (currentStep === 2 ? currentStep : 2));
      }
    };

    const handleWheel = (event) => {
      if (event.ctrlKey) return;
      const delta = normalizeWheelDelta(event, scroller.clientHeight);
      if (
        Math.abs(delta.y) <=
        Math.abs(delta.x) * WHEEL_VERTICAL_DOMINANCE
      ) {
        return;
      }
      if (activeTween || isProgrammaticScroll) {
        event.preventDefault();
        event.stopPropagation?.();
        wheelTransitionLock = true;
        scheduleWheelGestureSettlement();
        return;
      }

      if (contentMode) {
        if (reduceMotion) return;
        const direction = Math.sign(delta.y);

        if (!direction) return;
        if (handleFeaturedExpansionInput(event, delta.y, direction, { smooth: true })) return;
        handleContentBoundaryWheel(event, delta.y, direction);
        return;
      }

      event.preventDefault();
      scheduleWheelGestureSettlement();
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
      if (event.pointerType !== "touch" || !event.isPrimary || touchGesture) return;

      const featuredProjectReady =
        contentMode &&
        activeSectionRef.current === "featured-projects" &&
        !reduceMotion;
      if (featuredProjectReady) {
        const projectPanels = getFeaturedProjectPanels();
        const projectIndex = activeFeaturedProjectIndexRef.current;
        const bounds = getPanelScrollBounds(projectPanels[projectIndex]);
        const imageProject = isFeaturedImageProject(projectIndex, projectPanels);
        touchGesture = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startScrollTop: scroller.scrollTop,
          featuredProject: true,
          featuredBounds: bounds,
          featuredExpansion: imageProject && bounds
            ? {
              boundaryScrollTop: bounds.end,
              distanceToEnd: Math.max(0, bounds.end - scroller.scrollTop),
              projectIndex,
              startProgress: getFeaturedExpansionProgress(projectIndex),
            }
            : null,
          captured: false,
          consumed: false,
        };
        return;
      }

      if (contentMode) {
        touchGesture = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          nativeContent: true,
          consumed: false,
        };
        return;
      }

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

      if (touchGesture.nativeContent) return;

      const horizontalDistance = event.clientX - touchGesture.startX;
      const verticalDistance = touchGesture.startY - event.clientY;
      if (touchGesture.featuredProject) {
        const expansion = touchGesture.featuredExpansion;
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

        if (expansion) {
          const expands =
            verticalDistance > 0 &&
            expansion.startProgress < 1 &&
            verticalDistance + FEATURED_PROJECT_EDGE_TOLERANCE_PX >=
              expansion.distanceToEnd;
          const contracts =
            verticalDistance < 0 && expansion.startProgress > 0;

          if (expands || contracts) {
            scroller.scrollTop = expansion.boundaryScrollTop;
            const nativeDistance = expands ? expansion.distanceToEnd : 0;
            const scrubDistance = verticalDistance - nativeDistance;
            setFeaturedExpansionProgress(
              expansion.projectIndex,
              advanceFeaturedExpansionProgress(
                expansion.startProgress,
                scrubDistance,
                scroller.clientHeight,
              ),
            );
            return;
          }

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

        const boundary = getContentWheelBoundary(direction);
        const distanceToBoundary = boundary
          ? Math.max(
              0,
              direction * (boundary.scrollTop - touchGesture.startScrollTop),
            )
          : Number.POSITIVE_INFINITY;

        if (
          boundary &&
          distanceToBoundary <=
            absoluteVerticalDistance + FEATURED_PROJECT_EDGE_TOLERANCE_PX
        ) {
          scroller.scrollTop = boundary.scrollTop;
          touchGesture.consumed = true;
          boundary.transition();
          return;
        }

        const bounds = touchGesture.featuredBounds;
        if (bounds) {
          scroller.scrollTop = Math.min(
            Math.max(
              touchGesture.startScrollTop + verticalDistance,
              bounds.start,
            ),
            bounds.end,
          );
          synchronizeContentScroll();
        }
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
        const keyboardTravelDistance =
          event.key === "PageDown" || event.key === "PageUp" || event.key === " "
            ? direction * scroller.clientHeight
            : direction * 40;
        if (
          activeSectionRef.current === "featured-projects" &&
          handleFeaturedExpansionInput(
            event,
            keyboardTravelDistance,
            direction,
          )
        ) {
          return;
        }
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
      if (isProgrammaticScroll) {
        synchronizeContentTitleVisibility();
        return;
      }
      if (contentMode) {
        if (pinFeaturedExpansion()) {
          synchronizeContentTitleVisibility();
          return;
        }
        synchronizeContentScroll();
        return;
      }
      synchronizeContentTitleVisibility();
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
          synchronizeContentTitleVisibility();
        });
      });
    };

    isProgrammaticScroll = true;
    ignoreNextScrollEnd = supportsScrollEnd;
    synchronizeContentTitleVisibility();
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
      featuredExpansionTweens.forEach((tween) => tween.kill());
      featuredExpansionTweens.clear();
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
  }, [
    enabled,
    featuredProjectExpansionProgress,
    featuredProjectPreparationOffsets,
    reduceMotion,
    statementProgress,
  ]);

  return {
    activeFeaturedProjectIndex,
    activeSectionId,
    featuredStep,
    featuredProjectExpansionProgress,
    featuredProjectPreparationOffsets,
    contentScrollActive,
    navigateToSection,
    completeTitleReveal,
    navigationState,
    scrollerRef,
    statementPanelIndex: STATEMENT_PANEL_INDEX,
    statementProgress,
    visibleContentTitleIds,
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
  isVisibleWithinViewport,
};
export default useHomeScrollController;
