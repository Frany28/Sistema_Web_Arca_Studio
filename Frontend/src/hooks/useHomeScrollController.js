import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useMotionValue } from "motion/react";

import { createHomeStatementController } from "./homeScroll/createHomeStatementController.js";
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
const SERVICES_PANEL_INDEX = 4;
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
  const navigateToPanelRef = useRef(() => false);
  const statementProgress = useMotionValue(0);
  const navigateToPanel = useCallback(
    (panelIndex) => navigateToPanelRef.current(panelIndex),
    [],
  );

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
    let resizeFrame;
    let scrollSettleTimer;
    let wheelTransitionLock = false;
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
      if (activeTween) return false;
      const currentState = navigationStateRef.current;
      let nextState = getNextHomeScrollState(
        currentState,
        direction,
        panels.length,
      );
      const destinationPanel = panels[nextState?.panelIndex];
      if (
        nextState?.panelIndex !== currentState.panelIndex &&
        destinationPanel?.hasAttribute("data-home-reveal-on-entry")
      ) {
        nextState = createHomeScrollState({
          panelIndex: nextState.panelIndex,
          phase: HOME_SCROLL_PHASES.TITLE,
        });
      }
      return nextState === currentState ? false : alignToPanel(nextState);
    };

    const resetWheelGesture = () => {
      wheelGestureState = createWheelGestureState();
      statement.resetWheelScrubbing();
      wheelTransitionLock = false;
    };

    navigateToPanelRef.current = (panelIndex) => {
      if (!Number.isInteger(panelIndex) || !panels[panelIndex]) return false;
      activeTween?.kill();
      activeTween = undefined;
      isProgrammaticScroll = false;
      resetWheelGesture();
      return alignToPanel(
        createHomeScrollState({
          panelIndex,
          phase: HOME_SCROLL_PHASES.TITLE,
        }),
      );
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
      statement.stopAnimation();
      if (wheelTransitionLock) return;

      const currentState = navigationStateRef.current;
      const isStatementReady =
        currentState.panelIndex === STATEMENT_PANEL_INDEX && !activeTween;
      if (isStatementReady && statement.isWheelScrubbing()) {
        statement.queueDelta(limitHomeStatementWheelDelta(delta.y));
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
        if (currentProgress <= 0 && direction === HOME_SCROLL_DIRECTIONS.UP) {
          moveByDirection(direction);
          return;
        }
        if (currentProgress >= 1 && direction === HOME_SCROLL_DIRECTIONS.DOWN) {
          moveByDirection(direction);
          return;
        }

        statement.startWheelScrubbing();
        statement.queueDelta(limitHomeStatementWheelDelta(delta.y));
        return;
      }

      if (!activeTween && wheelGestureState.triggeredDirection !== null) {
        moveByDirection(wheelGestureState.triggeredDirection);
      }
    };

    const handlePointerDown = (event) => {
      if (event.pointerType !== "touch" || !event.isPrimary) return;
      const isStatementGesture =
        navigationStateRef.current.panelIndex === STATEMENT_PANEL_INDEX;

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
          touchGesture.startProgress <= 0 &&
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
          moveByDirection(HOME_SCROLL_DIRECTIONS.DOWN);
          return;
        }

        statement.commitProgress(
          advanceHomeStatementProgress(
            touchGesture.startProgress,
            verticalDistance,
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

      event.preventDefault();
      if (event.repeat) return;
      const currentState = navigationStateRef.current;
      if (currentState.panelIndex === STATEMENT_PANEL_INDEX && !activeTween) {
        const currentProgress = statement.getProgress();
        if (currentProgress <= 0 && direction === HOME_SCROLL_DIRECTIONS.UP) {
          moveByDirection(direction);
          return;
        }
        if (currentProgress >= 1 && direction === HOME_SCROLL_DIRECTIONS.DOWN) {
          moveByDirection(direction);
          return;
        }

        statement.animateTo(direction === HOME_SCROLL_DIRECTIONS.DOWN ? 1 : 0);
        return;
      }

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
      const currentState = navigationStateRef.current;
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
    if (supportsScrollEnd) scroller.addEventListener("scrollend", handleScrollEnd);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(scrollSettleTimer);
      window.clearTimeout(wheelIdleTimer);
      navigateToPanelRef.current = () => false;
      activeTween?.kill();
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
    navigationState,
    navigateToPanel,
    scrollerRef,
    servicesPanelIndex: SERVICES_PANEL_INDEX,
    statementPanelIndex: STATEMENT_PANEL_INDEX,
    statementProgress,
  };
}

export {
  SCROLL_STEP_DURATION_SECONDS,
  SCROLL_SETTLE_DELAY_MS,
  SERVICES_PANEL_INDEX,
  STATEMENT_PANEL_INDEX,
  TOUCH_SWIPE_THRESHOLD_PX,
  TOUCH_VERTICAL_DOMINANCE,
  WHEEL_GESTURE_IDLE_MS,
  WHEEL_GESTURE_THRESHOLD_PX,
};
export default useHomeScrollController;
