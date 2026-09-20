import { gsap } from "gsap";

import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  createScrollbarHomeScrollState,
} from "../../utils/homeScrollNavigation.js";

const STATEMENT_KEYBOARD_DURATION_SECONDS = 2;
const STATEMENT_AUTO_REVEAL_DURATION_SECONDS = 3.6;
const STATEMENT_DESKTOP_SCRUB_DURATION_SECONDS = 2.2;

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
  let autoRevealing = false;
  let scrubTargetProgress;

  const stopAnimation = () => {
    progressTween?.kill();
    progressTween = undefined;
    autoRevealing = false;
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
        scrubTargetProgress ?? progress.get(),
        delta,
        getViewportHeight(),
        reduceMotion,
      );
      scrubTargetProgress = nextProgress;
      if (reduceMotion) {
        commitProgress(nextProgress);
        if (nextProgress === 0 || nextProgress === 1) wheelScrubbing = false;
        return;
      }

      const animatedProgress = { value: progress.get() };
      progressTween = gsap.to(animatedProgress, {
        value: nextProgress,
        duration: STATEMENT_DESKTOP_SCRUB_DURATION_SECONDS,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => progress.set(animatedProgress.value),
        onComplete: () => {
          progressTween = undefined;
          if (scrubTargetProgress !== nextProgress) return;
          commitProgress(nextProgress);
          if (nextProgress === 0 || nextProgress === 1) wheelScrubbing = false;
        },
      });
    });
  };

  const animateTo = (
    targetProgress,
    onComplete,
    {
      duration = STATEMENT_KEYBOARD_DURATION_SECONDS,
      ease = "sine.inOut",
    } = {},
  ) => {
    stopAnimation();
    scrubTargetProgress = undefined;
    if (reduceMotion) {
      commitProgress(targetProgress);
      onComplete?.();
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
      duration,
      ease,
      overwrite: true,
      onUpdate: () => progress.set(animatedProgress.value),
      onComplete: () => {
        progressTween = undefined;
        commitProgress(targetProgress);
        onComplete?.();
      },
    });
  };

  const animateAutomatically = (targetProgress, onComplete) => {
    stopAnimation();
    scrubTargetProgress = undefined;
    if (reduceMotion) {
      commitProgress(targetProgress);
      onComplete?.();
      return true;
    }

    const animatedProgress = { value: progress.get() };
    autoRevealing = true;
    commitNavigationState({
      panelIndex,
      phase: HOME_SCROLL_PHASES.EFFECT,
      entryDirection: null,
    });
    progressTween = gsap.to(animatedProgress, {
      value: targetProgress,
      duration: STATEMENT_AUTO_REVEAL_DURATION_SECONDS,
      ease: "sine.inOut",
      overwrite: true,
      onUpdate: () => progress.set(animatedProgress.value),
      onComplete: () => {
        progressTween = undefined;
        autoRevealing = false;
        commitProgress(targetProgress);
        onComplete?.();
      },
    });
    return true;
  };

  const startAutoReveal = (onComplete) =>
    animateAutomatically(1, onComplete);

  const startAutoReverse = (onComplete) =>
    animateAutomatically(0, onComplete);

  const synchronizeWithNavigation = (nextState, currentState) => {
    stopAnimation();
    scrubTargetProgress = undefined;
    if (nextState.panelIndex === panelIndex) {
      progress.set(nextState.phase === HOME_SCROLL_PHASES.TITLE ? 1 : 0);
    } else if (currentState.panelIndex === panelIndex) {
      progress.set(0);
    }
  };

  const resetForNativeScroll = () => {
    stopAnimation();
    scrubTargetProgress = undefined;
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
    isAutoRevealing: () => autoRevealing,
    queueDelta,
    resetForNativeScroll,
    resetWheelScrubbing: () => {
      wheelScrubbing = false;
    },
    startWheelScrubbing: () => {
      wheelScrubbing = true;
    },
    stopAnimation,
    startAutoReverse,
    startAutoReveal,
    synchronizeWithNavigation,
  };
}

export {
  STATEMENT_AUTO_REVEAL_DURATION_SECONDS,
  STATEMENT_DESKTOP_SCRUB_DURATION_SECONDS,
  STATEMENT_KEYBOARD_DURATION_SECONDS,
  createHomeStatementController,
};
