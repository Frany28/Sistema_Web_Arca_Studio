import { gsap } from "gsap";

import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  createScrollbarHomeScrollState,
} from "../../utils/homeScrollNavigation.js";

/*
 * Navegación por teclado.
 */
const STATEMENT_KEYBOARD_DURATION_SECONDS = 1.6;

/*
 * Tablet / mobile:
 * aparición automática del efecto.
 */
const STATEMENT_AUTO_REVEAL_DURATION_SECONDS = 3;

/*
 * Tablet / mobile:
 * al regresar queremos recuperar el video
 * claramente más rápido que al revelar.
 */
const STATEMENT_AUTO_REVERSE_DURATION_SECONDS = 1.6;

/*
 * Desktop wheel / trackpad.
 *
 * Menor número = responde más rápido.
 *
 * DOWN:
 * zoom-out / aparición del texto.
 *
 * UP:
 * regreso al video.
 */
const STATEMENT_WHEEL_FORWARD_SMOOTHING_MS = 165;
const STATEMENT_WHEEL_REVERSE_SMOOTHING_MS = 90;

/*
 * Permite terminar ligeramente antes el seguimiento
 * para evitar una cola demasiado larga cuando estamos
 * prácticamente en 0 o 1.
 */
const STATEMENT_WHEEL_EPSILON = 0.001;

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

  /*
   * Dirección actual del scrub:
   *
   *  1 = zoom-out
   * -1 = regreso al video
   */
  let wheelScrubDirection = 0;

  const commitProgress = (nextProgress) => {
    const currentState = getNavigationState();

    progress.set(nextProgress);

    if (
      currentState.panelIndex !== panelIndex
    ) {
      return;
    }

    const nextPhase =
      nextProgress <= 0
        ? HOME_SCROLL_PHASES.IMAGE
        : nextProgress >= 1
          ? HOME_SCROLL_PHASES.TITLE
          : HOME_SCROLL_PHASES.EFFECT;

    if (
      currentState.phase === nextPhase
    ) {
      return;
    }

    commitNavigationState({
      panelIndex,
      phase: nextPhase,

      entryDirection:
        nextPhase ===
        HOME_SCROLL_PHASES.IMAGE
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
    wheelScrubDirection = 0;
  };

  const stopAnimation = () => {
    progressTween?.kill();
    progressTween = undefined;

    stopWheelScrubAnimation();

    wheelTargetProgress = progress.get();

    autoRevealing = false;
  };

  /*
   * Loop único de suavizado.
   *
   * No creamos un tween GSAP por cada wheel.
   * El progreso visual persigue continuamente
   * wheelTargetProgress.
   */
  const runWheelScrub = (timestamp) => {
    if (
      isPanelTransitioning() ||
      getNavigationState().panelIndex !==
        panelIndex
    ) {
      scrubAnimationFrame = undefined;
      lastScrubTimestamp = 0;
      wheelScrubDirection = 0;

      return;
    }

    if (!lastScrubTimestamp) {
      lastScrubTimestamp = timestamp;
    }

    /*
     * Evita que un frame lento produzca
     * un salto visual demasiado grande.
     */
    const deltaTime = Math.min(
      timestamp - lastScrubTimestamp,
      32,
    );

    lastScrubTimestamp = timestamp;

    const currentProgress = progress.get();

    /*
     * Detectamos hacia dónde está intentando
     * ir realmente el target.
     */
    const targetDifference =
      wheelTargetProgress -
      currentProgress;

    if (
      Math.abs(targetDifference) >
      STATEMENT_WHEEL_EPSILON
    ) {
      wheelScrubDirection =
        targetDifference > 0 ? 1 : -1;
    }

    /*
     * Al bajar queremos un zoom-out fluido,
     * pero un poco más rápido.
     *
     * Al subir queremos volver al video
     * claramente más rápido.
     */
    const smoothingDuration =
      wheelScrubDirection < 0
        ? STATEMENT_WHEEL_REVERSE_SMOOTHING_MS
        : STATEMENT_WHEEL_FORWARD_SMOOTHING_MS;

    /*
     * Suavizado exponencial independiente
     * de los FPS de la pantalla.
     */
    const smoothing =
      1 -
      Math.exp(
        -deltaTime / smoothingDuration,
      );

    let nextProgress =
      currentProgress +
      targetDifference * smoothing;

    /*
     * Protección numérica.
     */
    nextProgress = Math.min(
      Math.max(nextProgress, 0),
      1,
    );

    const distanceToTarget = Math.abs(
      wheelTargetProgress -
        nextProgress,
    );

    /*
     * Si ya estamos suficientemente cerca,
     * fijamos directamente el endpoint.
     *
     * Esto es especialmente importante
     * cuando regresamos al video:
     * evita permanecer innecesariamente
     * en el estado intermedio.
     */
    if (
      distanceToTarget <=
      STATEMENT_WHEEL_EPSILON
    ) {
      commitProgress(
        wheelTargetProgress,
      );

      scrubAnimationFrame = undefined;
      lastScrubTimestamp = 0;
      wheelScrubDirection = 0;

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
     * Acumulamos los eventos wheel que llegan
     * dentro del mismo frame.
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
         * Guardamos la dirección inmediatamente.
         *
         * Esto permite que al cambiar de bajar
         * a subir, el smoothing rápido de regreso
         * se aplique desde el primer gesto.
         */
        if (delta > 0) {
          wheelScrubDirection = 1;
        } else if (delta < 0) {
          wheelScrubDirection = -1;
        }

        /*
         * La rueda modifica únicamente el target.
         * El progreso visual se actualiza
         * independientemente mediante runWheelScrub.
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
         * Ya existe un loop:
         * solamente modificamos el target.
         */
        if (scrubAnimationFrame) {
          return;
        }

        lastScrubTimestamp = 0;

        scrubAnimationFrame =
          window.requestAnimationFrame(
            runWheelScrub,
          );
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

    wheelTargetProgress =
      targetProgress;

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

          commitProgress(
            targetProgress,
          );

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

    wheelTargetProgress =
      targetProgress;

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

    /*
     * Reveal lento y estético.
     *
     * Reverse notablemente más rápido,
     * porque queremos recuperar el video
     * sin permanecer demasiado tiempo
     * en el estado intermedio.
     */
    const duration =
      targetProgress <= 0
        ? STATEMENT_AUTO_REVERSE_DURATION_SECONDS
        : STATEMENT_AUTO_REVEAL_DURATION_SECONDS;

    progressTween = gsap.to(
      animatedProgress,
      {
        value: targetProgress,

        duration,

        ease:
          targetProgress <= 0
            ? "power2.out"
            : "sine.inOut",

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

          commitProgress(
            targetProgress,
          );

          onComplete?.();
        },
      },
    );

    return true;
  };

  const startAutoReveal = (
    onComplete,
  ) =>
    animateAutomatically(
      1,
      onComplete,
    );

  const startAutoReverse = (
    onComplete,
  ) =>
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
      nextState.panelIndex ===
      panelIndex
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
      currentState.panelIndex ===
      panelIndex
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

        animationFrame = undefined;
      }

      stopWheelScrubAnimation();

      progressTween?.kill();
      progressTween = undefined;

      pendingDelta = 0;
    },

    getProgress: () =>
      progress.get(),

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