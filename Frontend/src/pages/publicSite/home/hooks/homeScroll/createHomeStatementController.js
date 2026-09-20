import { gsap } from "gsap";

import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  createScrollbarHomeScrollState,
} from "../../utils/homeScrollNavigation.js";

const STATEMENT_KEYBOARD_DURATION_SECONDS = 2;
const STATEMENT_AUTO_REVEAL_DURATION_SECONDS = 3.6;

// Suavizado exclusivo del zoom-out controlado por wheel/trackpad.
const STATEMENT_WHEEL_SMOOTHING_MS = 200;
const STATEMENT_WHEEL_EPSILON = 0.0005;

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
  let scrubAnimationFrame;

  let pendingDelta = 0;
  let lastScrubTimestamp = 0;

  let progressTween;

  let wheelScrubbing = false;
  let autoRevealing = false;

  let wheelTargetProgress = progress.get();

  const commitProgress = (nextProgress) => {
    const currentState = getNavigationState();

    progress.set(nextProgress);

    if (currentState.panelIndex !== panelIndex) {
      return;
    }

    const nextPhase =
      nextProgress <= 0
        ? HOME_SCROLL_PHASES.IMAGE
        : nextProgress >= 1
          ? HOME_SCROLL_PHASES.TITLE
          : HOME_SCROLL_PHASES.EFFECT;

    if (currentState.phase === nextPhase) {
      return;
    }

    commitNavigationState({
      panelIndex,
      phase: nextPhase,
      entryDirection:
        nextPhase === HOME_SCROLL_PHASES.IMAGE
          ? HOME_SCROLL_DIRECTIONS.DOWN
          : null,
    });
  };

  const stopWheelScrubAnimation = () => {
    if (scrubAnimationFrame) {
      window.cancelAnimationFrame(
        scrubAnimationFrame,
      );

      scrubAnimationFrame = undefined;
    }

    lastScrubTimestamp = 0;
  };

  const stopAnimation = () => {
    progressTween?.kill();
    progressTween = undefined;

    stopWheelScrubAnimation();

    wheelTargetProgress = progress.get();

    autoRevealing = false;
  };

  const runWheelScrub = (timestamp) => {
    if (
      isPanelTransitioning() ||
      getNavigationState().panelIndex !== panelIndex
    ) {
      scrubAnimationFrame = undefined;
      lastScrubTimestamp = 0;

      return;
    }

    if (!lastScrubTimestamp) {
      lastScrubTimestamp = timestamp;
    }

    const deltaTime = Math.min(
      timestamp - lastScrubTimestamp,
      50,
    );

    lastScrubTimestamp = timestamp;

    const currentProgress = progress.get();

    /*
     * Suavizado exponencial dependiente del tiempo.
     *
     * Esto hace que el progreso visual persiga
     * wheelTargetProgress sin crear un tween nuevo
     * cada vez que llega un evento wheel.
     */
    const smoothing =
      1 -
      Math.exp(
        -deltaTime /
          STATEMENT_WHEEL_SMOOTHING_MS,
      );

    const nextProgress =
      currentProgress +
      (wheelTargetProgress - currentProgress) *
        smoothing;

    const distanceToTarget = Math.abs(
      wheelTargetProgress - nextProgress,
    );

    /*
     * Cuando estamos suficientemente cerca del
     * objetivo, fijamos el valor exacto para evitar
     * que quede flotando infinitamente.
     */
    if (
      distanceToTarget <=
      STATEMENT_WHEEL_EPSILON
    ) {
      commitProgress(wheelTargetProgress);

      scrubAnimationFrame = undefined;
      lastScrubTimestamp = 0;

      if (
        wheelTargetProgress <= 0 ||
        wheelTargetProgress >= 1
      ) {
        wheelScrubbing = false;
      }

      return;
    }

    commitProgress(nextProgress);

    scrubAnimationFrame =
      window.requestAnimationFrame(
        runWheelScrub,
      );
  };

  const queueDelta = (deltaY) => {
    pendingDelta += deltaY;

    /*
     * Agrupamos todos los wheel events del mismo
     * frame para evitar trabajo duplicado.
     */
    if (animationFrame) {
      return;
    }

    animationFrame =
      window.requestAnimationFrame(() => {
        animationFrame = undefined;

        const delta = pendingDelta;

        pendingDelta = 0;

        if (
          isPanelTransitioning() ||
          getNavigationState().panelIndex !==
            panelIndex
        ) {
          return;
        }

        /*
         * El wheel modifica el TARGET, no el
         * progreso visual directamente.
         */
        wheelTargetProgress =
          advanceHomeStatementProgress(
            wheelTargetProgress,
            delta,
            getViewportHeight(),
            reduceMotion,
          );

        if (reduceMotion) {
          commitProgress(
            wheelTargetProgress,
          );

          return;
        }

        /*
         * Si el loop de scrub ya está funcionando,
         * no creamos otro.
         *
         * Solo actualizamos wheelTargetProgress
         * y el loop existente seguirá persiguiéndolo.
         */
        if (!scrubAnimationFrame) {
          lastScrubTimestamp = 0;

          scrubAnimationFrame =
            window.requestAnimationFrame(
              runWheelScrub,
            );
        }
      });
  };

  const animateTo = (
    targetProgress,
    onComplete,
    {
      duration =
        STATEMENT_KEYBOARD_DURATION_SECONDS,
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

    progressTween = gsap.to(
      animatedProgress,
      {
        value: targetProgress,
        duration,
        ease,
        overwrite: true,

        onUpdate: () => {
          progress.set(
            animatedProgress.value,
          );
        },

        onComplete: () => {
          progressTween = undefined;

          wheelTargetProgress =
            targetProgress;

          commitProgress(targetProgress);

          onComplete?.();
        },
      },
    );
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

    progressTween = gsap.to(
      animatedProgress,
      {
        value: targetProgress,
        duration:
          STATEMENT_AUTO_REVEAL_DURATION_SECONDS,
        ease: "sine.inOut",
        overwrite: true,

        onUpdate: () => {
          progress.set(
            animatedProgress.value,
          );
        },

        onComplete: () => {
          progressTween = undefined;
          autoRevealing = false;

          wheelTargetProgress =
            targetProgress;

          commitProgress(targetProgress);

          onComplete?.();
        },
      },
    );

    return true;
  };

  const startAutoReveal = (onComplete) =>
    animateAutomatically(
      1,
      onComplete,
    );

  const startAutoReverse = (onComplete) =>
    animateAutomatically(
      0,
      onComplete,
    );

  const synchronizeWithNavigation = (
    nextState,
    currentState,
  ) => {
    stopAnimation();

    if (
      nextState.panelIndex === panelIndex
    ) {
      const nextProgress =
        nextState.phase ===
        HOME_SCROLL_PHASES.TITLE
          ? 1
          : 0;

      wheelTargetProgress =
        nextProgress;

      progress.set(nextProgress);

      return;
    }

    if (
      currentState.panelIndex === panelIndex
    ) {
      wheelTargetProgress = 0;

      progress.set(0);
    }
  };

  const resetForNativeScroll = () => {
    stopAnimation();

    wheelScrubbing = false;

    const currentState =
      getNavigationState();

    if (
      currentState.panelIndex !==
        panelIndex ||
      (
        progress.get() === 0 &&
        currentState.phase ===
          HOME_SCROLL_PHASES.IMAGE
      )
    ) {
      return false;
    }

    wheelTargetProgress = 0;

    progress.set(0);

    commitNavigationState(
      createScrollbarHomeScrollState(
        panelIndex,
        {
          settled: false,
        },
      ),
    );

    return true;
  };

  return {
    animateTo,

    commitProgress,

    destroy() {
      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame,
        );
      }

      stopWheelScrubAnimation();

      progressTween?.kill();
      progressTween = undefined;

      pendingDelta = 0;
    },

    getProgress: () => progress.get(),

    isWheelScrubbing: () =>
      wheelScrubbing,

    isAutoRevealing: () =>
      autoRevealing,

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