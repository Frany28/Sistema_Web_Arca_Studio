import { gsap } from "gsap";

import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  createScrollbarHomeScrollState,
} from "../../utils/homeScrollNavigation.js";

const STATEMENT_KEYBOARD_DURATION_SECONDS = 2;
const STATEMENT_AUTO_REVEAL_DURATION_SECONDS = 3.6;
const STATEMENT_WHEEL_SCRUB_DURATION_SECONDS = 0.42;

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
  let wheelProgressTween;

  let wheelScrubbing = false;
  let autoRevealing = false;

  let wheelTargetProgress = progress.get();

  const stopWheelProgressTween = () => {
    wheelProgressTween?.kill();
    wheelProgressTween = undefined;
  };

  const stopAnimation = () => {
    progressTween?.kill();
    progressTween = undefined;

    stopWheelProgressTween();

    wheelTargetProgress = progress.get();
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

      if (
        isPanelTransitioning() ||
        getNavigationState().panelIndex !== panelIndex
      ) {
        return;
      }

      wheelTargetProgress = advanceHomeStatementProgress(
        wheelTargetProgress,
        delta,
        getViewportHeight(),
        reduceMotion,
      );

      if (reduceMotion) {
        commitProgress(wheelTargetProgress);
        return;
      }

      stopWheelProgressTween();

      const animatedProgress = {
        value: progress.get(),
      };

      wheelProgressTween = gsap.to(animatedProgress, {
        value: wheelTargetProgress,
        duration: STATEMENT_WHEEL_SCRUB_DURATION_SECONDS,
        ease: "power2.out",
        overwrite: true,

        onUpdate: () => {
          commitProgress(animatedProgress.value);
        },

        onComplete: () => {
          wheelProgressTween = undefined;

          commitProgress(wheelTargetProgress);

          if (
            wheelTargetProgress <= 0 ||
            wheelTargetProgress >= 1
          ) {
            wheelScrubbing = false;
          }
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

    wheelTargetProgress = targetProgress;

    if (reduceMotion) {
      commitProgress(targetProgress);
      onComplete?.();
      return;
    }

    const animatedProgress = {
      value: progress.get(),
    };

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

      onUpdate: () => {
        progress.set(animatedProgress.value);
      },

      onComplete: () => {
        progressTween = undefined;
        wheelTargetProgress = targetProgress;

        commitProgress(targetProgress);
        onComplete?.();
      },
    });
  };

  const animateAutomatically = (
    targetProgress,
    onComplete,
  ) => {
    stopAnimation();

    wheelTargetProgress = targetProgress;

    if (reduceMotion) {
      commitProgress(targetProgress);
      onComplete?.();
      return true;
    }

    const animatedProgress = {
      value: progress.get(),
    };

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

      onUpdate: () => {
        progress.set(animatedProgress.value);
      },

      onComplete: () => {
        progressTween = undefined;
        autoRevealing = false;

        wheelTargetProgress = targetProgress;

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

  const synchronizeWithNavigation = (
    nextState,
    currentState,
  ) => {
    stopAnimation();

    if (nextState.panelIndex === panelIndex) {
      const nextProgress =
        nextState.phase === HOME_SCROLL_PHASES.TITLE
          ? 1
          : 0;

      wheelTargetProgress = nextProgress;
      progress.set(nextProgress);
    } else if (currentState.panelIndex === panelIndex) {
      wheelTargetProgress = 0;
      progress.set(0);
    }
  };

  const resetForNativeScroll = () => {
    stopAnimation();
    wheelScrubbing = false;

    const currentState = getNavigationState();

    if (
      currentState.panelIndex !== panelIndex ||
      (
        progress.get() === 0 &&
        currentState.phase === HOME_SCROLL_PHASES.IMAGE
      )
    ) {
      return false;
    }

    wheelTargetProgress = 0;
    progress.set(0);

    commitNavigationState(
      createScrollbarHomeScrollState(panelIndex, {
        settled: false,
      }),
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
  STATEMENT_KEYBOARD_DURATION_SECONDS,
  createHomeStatementController,
};