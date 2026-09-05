import { gsap } from "gsap";

import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  createScrollbarHomeScrollState,
} from "../../utils/homeScrollNavigation.js";

const STATEMENT_KEYBOARD_DURATION_SECONDS = 0.35;

function createHomeStatementController({
  commitNavigationState,
  getNavigationState,
  getViewportHeight,
  isPanelTransitioning,
  panelIndex,
  progress,
  reduceMotion,
}) {
  let animationFrame;
  let pendingDelta = 0;
  let progressTween;
  let wheelScrubbing = false;

  const stopAnimation = () => {
    progressTween?.kill();
    progressTween = undefined;
  };

  const commitProgress = (nextProgress) => {
    const currentState = getNavigationState();
    progress.set(nextProgress);
    if (currentState.panelIndex !== panelIndex) return;

    const nextPhase =
      nextProgress <= 0
        ? HOME_SCROLL_PHASES.IMAGE
        : nextProgress >= 1
          ? HOME_SCROLL_PHASES.TITLE
          : HOME_SCROLL_PHASES.EFFECT;

    if (currentState.phase === nextPhase) return;
    commitNavigationState({
      panelIndex,
      phase: nextPhase,
      entryDirection:
        nextPhase === HOME_SCROLL_PHASES.IMAGE
          ? HOME_SCROLL_DIRECTIONS.DOWN
          : null,
    });
  };

  const queueDelta = (deltaY) => {
    pendingDelta += deltaY;
    if (animationFrame) return;

    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = undefined;
      const delta = pendingDelta;
      pendingDelta = 0;
      if (isPanelTransitioning() || getNavigationState().panelIndex !== panelIndex) {
        return;
      }

      const nextProgress = advanceHomeStatementProgress(
        progress.get(),
        delta,
        getViewportHeight(),
        reduceMotion,
      );
      commitProgress(nextProgress);
      if (nextProgress === 0 || nextProgress === 1) wheelScrubbing = false;
    });
  };

  const animateTo = (targetProgress) => {
    stopAnimation();
    if (reduceMotion) {
      commitProgress(targetProgress);
      return;
    }

    const animatedProgress = { value: progress.get() };
    commitNavigationState({
      panelIndex,
      phase: HOME_SCROLL_PHASES.EFFECT,
      entryDirection: null,
    });
    progressTween = gsap.to(animatedProgress, {
      value: targetProgress,
      duration: STATEMENT_KEYBOARD_DURATION_SECONDS,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => progress.set(animatedProgress.value),
      onComplete: () => {
        progressTween = undefined;
        commitProgress(targetProgress);
      },
    });
  };

  const synchronizeWithNavigation = (nextState, currentState) => {
    stopAnimation();
    if (nextState.panelIndex === panelIndex) {
      progress.set(nextState.phase === HOME_SCROLL_PHASES.TITLE ? 1 : 0);
    } else if (currentState.panelIndex === panelIndex) {
      progress.set(0);
    }
  };

  const resetForNativeScroll = () => {
    stopAnimation();
    wheelScrubbing = false;
    const currentState = getNavigationState();
    if (
      currentState.panelIndex !== panelIndex ||
      (progress.get() === 0 && currentState.phase === HOME_SCROLL_PHASES.IMAGE)
    ) {
      return false;
    }

    progress.set(0);
    commitNavigationState(
      createScrollbarHomeScrollState(panelIndex, { settled: false }),
    );
    return true;
  };

  return {
    animateTo,
    commitProgress,
    destroy() {
      window.cancelAnimationFrame(animationFrame);
      stopAnimation();
    },
    getProgress: () => progress.get(),
    isWheelScrubbing: () => wheelScrubbing,
    queueDelta,
    resetForNativeScroll,
    resetWheelScrubbing: () => {
      wheelScrubbing = false;
    },
    startWheelScrubbing: () => {
      wheelScrubbing = true;
    },
    stopAnimation,
    synchronizeWithNavigation,
  };
}

export { STATEMENT_KEYBOARD_DURATION_SECONDS, createHomeStatementController };
