import {
  HOME_SCROLL_DIRECTIONS,
  advanceFeaturedExpansionProgress,
  advanceHomeStatementProgress,
  advanceWheelGesture,
  getKeyboardDirection,
  getSwipeDirection,
  getWheelGestureDeltaScale,
  markWheelGestureIdle,
  normalizeWheelDelta,
} from "../../utils/homeScrollNavigation.js";
import {
  FEATURED_PROJECT_EDGE_TOLERANCE_PX,
  STATEMENT_PANEL_INDEX,
  TOUCH_SWIPE_THRESHOLD_PX,
  TOUCH_VERTICAL_DOMINANCE,
  WHEEL_GESTURE_IDLE_MS,
  WHEEL_GESTURE_THRESHOLD_PX,
  WHEEL_VERTICAL_DOMINANCE,
} from "./homeScrollConstants.js";

function isInteractiveTarget(target) {
  return (
    target instanceof Element &&
    Boolean(target.closest(
      'a, button, input, select, textarea, [contenteditable="true"], [role="button"]',
    ))
  );
}

function createInputGestureController({
  activeFeaturedProjectIndexRef,
  activeSectionRef,
  coordination,
  navigationStateRef,
  reduceMotion,
  runtime,
  scroller,
  statement,
}) {
  let touchGesture = null;

  const settleWheelGesture = () => {
    runtime.wheelGestureState = markWheelGestureIdle(runtime.wheelGestureState);
    runtime.wheelGestureDeltaScale = null;
    statement.resetWheelScrubbing();
    runtime.wheelTransitionLock = false;
  };

  const scheduleWheelGestureSettlement = () => {
    window.clearTimeout(runtime.wheelIdleTimer);
    runtime.wheelIdleTimer = window.setTimeout(
      settleWheelGesture,
      WHEEL_GESTURE_IDLE_MS,
    );
  };

  const observeConsumedWheelGesture = (deltaY, eventTime) => {
    if (!runtime.wheelGestureState.consumed) return;
    const observedGesture = advanceWheelGesture(
      runtime.wheelGestureState,
      deltaY,
      WHEEL_GESTURE_THRESHOLD_PX,
      eventTime,
    );
    runtime.wheelGestureState = {
      ...observedGesture,
      triggeredDirection: null,
    };
  };

  const debugWheel = (event, normalizedDelta, scaledDelta, direction, decision) => {
    if (!window.__ARCA_DEBUG_WHEEL__) return;
    const currentState = navigationStateRef.current;
    const featuredIndex = activeFeaturedProjectIndexRef.current;
    const gesture = runtime.wheelGestureState;

    console.debug("[home-wheel]", {
      timestamp: event.timeStamp,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
      normalizedDelta,
      scaledDelta,
      direction,
      wheelGestureState: { ...gesture },
      accumulator: gesture.accumulator,
      gestureDirection: gesture.direction,
      consumed: gesture.consumed,
      idle: gesture.idle,
      triggeredDirection: gesture.triggeredDirection,
      lastMagnitude: gesture.lastMagnitude,
      minimumMagnitudeAfterTrigger: gesture.minimumMagnitudeAfterTrigger,
      oppositeAccumulator: gesture.oppositeAccumulator,
      rearmAccumulator: gesture.rearmAccumulator,
      rearmLastMagnitude: gesture.rearmLastMagnitude,
      wheelTransitionLock: runtime.wheelTransitionLock,
      activeTween: Boolean(runtime.activeTween),
      isProgrammaticScroll: runtime.isProgrammaticScroll,
      contentMode: runtime.contentMode,
      panelIndex: currentState.panelIndex,
      phase: currentState.phase,
      activeSection: activeSectionRef.current,
      activeFeaturedProjectIndex: featuredIndex,
      featuredExpansionProgress:
        activeSectionRef.current === "featured-projects"
          ? coordination.featured.getExpansionProgress(featuredIndex)
          : null,
      decision,
    });
  };

  const handleWheel = (event) => {
    if (event.ctrlKey) {
      debugWheel(event, { x: 0, y: 0 }, { x: 0, y: 0 }, null, "IGNORED_CTRL_KEY");
      return;
    }
    const normalizedDelta = normalizeWheelDelta(event, scroller.clientHeight);
    if (
      Math.abs(normalizedDelta.y) <=
      Math.abs(normalizedDelta.x) * WHEEL_VERTICAL_DOMINANCE
    ) {
      debugWheel(event, normalizedDelta, normalizedDelta, null, "IGNORED_DIAGONAL");
      return;
    }

    runtime.wheelGestureDeltaScale ??= getWheelGestureDeltaScale(event);
    const progressDelta = {
      x: normalizedDelta.x * runtime.wheelGestureDeltaScale,
      y: normalizedDelta.y * runtime.wheelGestureDeltaScale,
    };
    if (runtime.activeTween || runtime.isProgrammaticScroll) {
      event.preventDefault();
      event.stopPropagation?.();
      observeConsumedWheelGesture(normalizedDelta.y, event.timeStamp);
      runtime.wheelTransitionLock = true;
      scheduleWheelGestureSettlement();
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        Math.sign(normalizedDelta.y),
        runtime.activeTween ? "BLOCKED_ACTIVE_TWEEN" : "BLOCKED_PROGRAMMATIC_SCROLL",
      );
      return;
    }

    if (runtime.contentMode) {
      if (reduceMotion) return;
      const direction = Math.sign(normalizedDelta.y);
      if (!direction) return;
      if (coordination.featured.handleExpansionInput(
        event,
        progressDelta.y,
        direction,
        { smooth: true },
      )) {
        debugWheel(event, normalizedDelta, progressDelta, direction, "FEATURED_EXPANSION");
        return;
      }
      coordination.featured.handleBoundaryWheel(event, normalizedDelta.y, direction);
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        direction,
        runtime.wheelGestureState.triggeredDirection !== null
          ? "FEATURED_TRANSITION"
          : "NATIVE_CONTENT_SCROLL",
      );
      return;
    }

    event.preventDefault();
    scheduleWheelGestureSettlement();
    if (runtime.wheelTransitionLock) {
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        Math.sign(normalizedDelta.y),
        "BLOCKED_TRANSITION_LOCK",
      );
      return;
    }
    statement.stopAnimation();

    const currentState = navigationStateRef.current;
    const isStatementReady =
      currentState.panelIndex === STATEMENT_PANEL_INDEX && !runtime.activeTween;
    if (isStatementReady && statement.getProgress() >= 1) {
      runtime.statementEnteringUp = false;
    }
    const previousWheelGestureState = runtime.wheelGestureState;
    runtime.wheelGestureState = advanceWheelGesture(
      runtime.wheelGestureState,
      normalizedDelta.y,
      WHEEL_GESTURE_THRESHOLD_PX,
      event.timeStamp,
    );
    if (isStatementReady && runtime.wheelGestureState.triggeredDirection !== null) {
      const direction = runtime.wheelGestureState.triggeredDirection;
      const currentProgress = statement.getProgress();
      if (
        currentProgress <= 0 &&
        direction === HOME_SCROLL_DIRECTIONS.UP &&
        !runtime.statementEnteringUp
      ) {
        coordination.panel.moveByDirection(direction);
        return;
      }
      if (currentProgress >= 1 && direction === HOME_SCROLL_DIRECTIONS.DOWN) {
        coordination.content.navigateSection("services");
        return;
      }

      statement.animateTo(
        runtime.statementEnteringUp || direction === HOME_SCROLL_DIRECTIONS.DOWN ? 1 : 0,
      );
      runtime.wheelTransitionLock = true;
      runtime.statementEnteringUp = false;
      debugWheel(event, normalizedDelta, progressDelta, direction, "STATEMENT_PHASE_TRANSITION");
      return;
    }

    if (!runtime.activeTween && runtime.wheelGestureState.triggeredDirection !== null) {
      coordination.panel.moveByDirection(runtime.wheelGestureState.triggeredDirection);
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        runtime.wheelGestureState.triggeredDirection,
        previousWheelGestureState.rearmAccumulator !== 0
          ? "REARMED -> TRIGGER_NAVIGATION"
          : "TRIGGER_NAVIGATION",
      );
      return;
    }

    const gesture = runtime.wheelGestureState;
    const gestureDecision = gesture.oppositeAccumulator !== 0
      ? "OPPOSITE_DIRECTION"
      : gesture.consumed &&
          (gesture.rearmAccumulator !== 0 ||
            gesture.minimumMagnitudeAfterTrigger !== Number.POSITIVE_INFINITY)
        ? "REARM_WAITING"
        : gesture.consumed
          ? "CONSUMED_INERTIA"
          : "ACCUMULATING";
    debugWheel(
      event,
      normalizedDelta,
      progressDelta,
      Math.sign(normalizedDelta.y),
      gestureDecision,
    );
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== "touch" || !event.isPrimary || touchGesture) return;

    const featuredProjectReady =
      runtime.contentMode &&
      activeSectionRef.current === "featured-projects" &&
      !reduceMotion;
    if (featuredProjectReady) {
      const projectPanels = coordination.featured.getProjectPanels();
      const projectIndex = activeFeaturedProjectIndexRef.current;
      const bounds = coordination.featured.getPanelScrollBounds(projectPanels[projectIndex]);
      const imageProject = coordination.featured.isImageProject(projectIndex, projectPanels);
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
              startProgress: coordination.featured.getExpansionProgress(projectIndex),
            }
          : null,
        captured: false,
        consumed: false,
      };
      return;
    }

    if (runtime.contentMode) {
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
    ) return;
    if (touchGesture.nativeContent) return;

    const horizontalDistance = event.clientX - touchGesture.startX;
    const verticalDistance = touchGesture.startY - event.clientY;
    if (touchGesture.featuredProject) {
      const expansion = touchGesture.featuredExpansion;
      const absoluteVerticalDistance = Math.abs(verticalDistance);
      const isVerticalGesture =
        absoluteVerticalDistance >= Math.abs(horizontalDistance) * TOUCH_VERTICAL_DOMINANCE;
      if (!isVerticalGesture) return;
      if (!touchGesture.captured && absoluteVerticalDistance < TOUCH_SWIPE_THRESHOLD_PX) return;

      event.preventDefault();
      touchGesture.captured = true;
      if (expansion) {
        const expands =
          verticalDistance > 0 &&
          expansion.startProgress < 1 &&
          verticalDistance + FEATURED_PROJECT_EDGE_TOLERANCE_PX >= expansion.distanceToEnd;
        const contracts = verticalDistance < 0 && expansion.startProgress > 0;
        if (expands || contracts) {
          scroller.scrollTop = expansion.boundaryScrollTop;
          const nativeDistance = expands ? expansion.distanceToEnd : 0;
          coordination.featured.setExpansionProgress(
            expansion.projectIndex,
            advanceFeaturedExpansionProgress(
              expansion.startProgress,
              verticalDistance - nativeDistance,
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
        { threshold: TOUCH_SWIPE_THRESHOLD_PX, verticalDominance: TOUCH_VERTICAL_DOMINANCE },
      );
      if (direction === null) return;

      const boundary = coordination.featured.getContentBoundary(direction);
      const distanceToBoundary = boundary
        ? Math.max(0, direction * (boundary.scrollTop - touchGesture.startScrollTop))
        : Number.POSITIVE_INFINITY;
      if (
        boundary &&
        distanceToBoundary <= absoluteVerticalDistance + FEATURED_PROJECT_EDGE_TOLERANCE_PX
      ) {
        scroller.scrollTop = boundary.scrollTop;
        touchGesture.consumed = true;
        boundary.transition();
        return;
      }

      const bounds = touchGesture.featuredBounds;
      if (bounds) {
        scroller.scrollTop = Math.min(
          Math.max(touchGesture.startScrollTop + verticalDistance, bounds.start),
          bounds.end,
        );
        coordination.content.synchronizeContentScroll();
      }
      return;
    }

    if (touchGesture.statement && !runtime.activeTween) {
      const absoluteVerticalDistance = Math.abs(verticalDistance);
      const isVerticalGesture =
        absoluteVerticalDistance >= Math.abs(horizontalDistance) * TOUCH_VERTICAL_DOMINANCE;
      if (!isVerticalGesture) return;
      if (!touchGesture.captured && absoluteVerticalDistance < TOUCH_SWIPE_THRESHOLD_PX) return;

      event.preventDefault();
      touchGesture.captured = true;
      statement.stopAnimation();
      if (
        touchGesture.startProgress <= 0 &&
        !runtime.statementEnteringUp &&
        verticalDistance < -TOUCH_SWIPE_THRESHOLD_PX
      ) {
        touchGesture.consumed = true;
        coordination.panel.moveByDirection(HOME_SCROLL_DIRECTIONS.UP);
        return;
      }
      if (
        touchGesture.startProgress >= 1 &&
        verticalDistance > TOUCH_SWIPE_THRESHOLD_PX
      ) {
        touchGesture.consumed = true;
        coordination.content.navigateSection("services");
        return;
      }

      statement.commitProgress(advanceHomeStatementProgress(
        touchGesture.startProgress,
        runtime.statementEnteringUp ? Math.abs(verticalDistance) : verticalDistance,
        scroller.clientHeight,
        reduceMotion,
      ));
      return;
    }

    const direction = getSwipeDirection(
      {
        startX: touchGesture.startX,
        startY: touchGesture.startY,
        endX: event.clientX,
        endY: event.clientY,
      },
      { threshold: TOUCH_SWIPE_THRESHOLD_PX, verticalDominance: TOUCH_VERTICAL_DOMINANCE },
    );
    if (direction === null) return;
    event.preventDefault();
    touchGesture.consumed = true;
    coordination.panel.moveByDirection(direction);
  };

  const clearTouchGesture = (event) => {
    if (touchGesture?.pointerId === event.pointerId) touchGesture = null;
  };

  const handleKeyDown = (event) => {
    const direction = getKeyboardDirection(event);
    if (direction === null || isInteractiveTarget(event.target)) return;
    if (runtime.activeTween || runtime.isProgrammaticScroll) {
      event.preventDefault();
      return;
    }
    if (runtime.contentMode) {
      const keyboardTravelDistance =
        event.key === "PageDown" || event.key === "PageUp" || event.key === " "
          ? direction * scroller.clientHeight
          : direction * 40;
      if (
        activeSectionRef.current === "featured-projects" &&
        coordination.featured.handleExpansionInput(event, keyboardTravelDistance, direction)
      ) return;
      if (
        activeSectionRef.current === "featured-projects" &&
        coordination.featured.getProjectTransition(direction, keyboardTravelDistance)
      ) {
        event.preventDefault();
        if (!event.repeat) {
          coordination.featured.transitionProject(direction, keyboardTravelDistance);
        }
      }
      return;
    }

    event.preventDefault();
    if (event.repeat) return;
    const currentState = navigationStateRef.current;
    if (currentState.panelIndex === STATEMENT_PANEL_INDEX && !runtime.activeTween) {
      const currentProgress = statement.getProgress();
      if (
        currentProgress <= 0 &&
        direction === HOME_SCROLL_DIRECTIONS.UP &&
        !runtime.statementEnteringUp
      ) {
        coordination.panel.moveByDirection(direction);
        return;
      }
      if (currentProgress >= 1 && direction === HOME_SCROLL_DIRECTIONS.DOWN) {
        coordination.content.navigateSection("services");
        return;
      }
      statement.animateTo(
        runtime.statementEnteringUp || direction === HOME_SCROLL_DIRECTIONS.DOWN ? 1 : 0,
      );
      runtime.statementEnteringUp = false;
      return;
    }
    coordination.panel.moveByDirection(direction);
  };

  const attach = () => {
    scroller.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    scroller.addEventListener("pointerdown", handlePointerDown, true);
    scroller.addEventListener("pointermove", handlePointerMove, {
      passive: false,
      capture: true,
    });
    scroller.addEventListener("pointerup", clearTouchGesture);
    scroller.addEventListener("pointercancel", clearTouchGesture);
    scroller.addEventListener("keydown", handleKeyDown);
    scroller.addEventListener("scroll", coordination.content.handleNativeScroll, { passive: true });
    if (runtime.supportsScrollEnd) {
      scroller.addEventListener("scrollend", coordination.content.handleScrollEnd);
    }
    window.addEventListener("resize", coordination.content.handleResize);
    window.addEventListener("orientationchange", coordination.content.handleResize);
  };

  const destroy = () => {
    window.clearTimeout(runtime.wheelIdleTimer);
    touchGesture = null;
    scroller.removeEventListener("wheel", handleWheel, true);
    scroller.removeEventListener("pointerdown", handlePointerDown, true);
    scroller.removeEventListener("pointermove", handlePointerMove, true);
    scroller.removeEventListener("pointerup", clearTouchGesture);
    scroller.removeEventListener("pointercancel", clearTouchGesture);
    scroller.removeEventListener("keydown", handleKeyDown);
    scroller.removeEventListener("scroll", coordination.content.handleNativeScroll);
    if (runtime.supportsScrollEnd) {
      scroller.removeEventListener("scrollend", coordination.content.handleScrollEnd);
    }
    window.removeEventListener("resize", coordination.content.handleResize);
    window.removeEventListener("orientationchange", coordination.content.handleResize);
  };

  return {
    attach,
    destroy,
    observeConsumedWheelGesture,
    scheduleWheelGestureSettlement,
  };
}

export { createInputGestureController, isInteractiveTarget };
