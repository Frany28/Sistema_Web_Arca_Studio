const HOME_SCROLL_PHASES = Object.freeze({
  IMAGE: "image",
  TITLE: "title",
  EFFECT: "effect",
});

const HOME_SCROLL_DIRECTIONS = Object.freeze({
  UP: -1,
  DOWN: 1,
});

const WHEEL_LINE_HEIGHT_PX = 16;
const WHEEL_REARM_MIN_DELAY_MS = 220;
const WHEEL_DECAY_MAGNITUDE_PX = 6;
const WHEEL_NEW_IMPULSE_MAGNITUDE_PX = 10;
const WHEEL_NEW_IMPULSE_RATIO = 1.8;
const STATEMENT_MIN_TRAVEL_PX = 200;
const STATEMENT_MAX_TRAVEL_PX = 320;
const STATEMENT_TRAVEL_VIEWPORT_RATIO = 0.3;
const STATEMENT_INITIAL_MASK_SCALE = 160;
const STATEMENT_OVERLAY_FADE_START_PROGRESS = 0.18;
const STATEMENT_OVERLAY_FADE_END_PROGRESS = 0.68;

function clampHomeStatementProgress(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(Math.max(progress, 0), 1);
}

function getHomeStatementTravelDistance(viewportHeight) {
  const safeViewportHeight = Number.isFinite(viewportHeight)
    ? viewportHeight
    : 0;

  return Math.min(
    Math.max(
      safeViewportHeight * STATEMENT_TRAVEL_VIEWPORT_RATIO,
      STATEMENT_MIN_TRAVEL_PX,
    ),
    STATEMENT_MAX_TRAVEL_PX,
  );
}

function advanceHomeStatementProgress(
  progress,
  deltaY,
  viewportHeight,
  reduceMotion = false,
) {
  const currentProgress = clampHomeStatementProgress(progress);

  if (!Number.isFinite(deltaY) || deltaY === 0) {
    return currentProgress;
  }

  if (reduceMotion) {
    return deltaY > 0 ? 1 : 0;
  }

  return clampHomeStatementProgress(
    currentProgress + deltaY / getHomeStatementTravelDistance(viewportHeight),
  );
}

function getHomeStatementVisualState(progress) {
  const normalizedProgress = clampHomeStatementProgress(progress);
  const easedProgress =
    normalizedProgress ** 2 * (3 - 2 * normalizedProgress);
  const overlayProgress = clampHomeStatementProgress(
    (normalizedProgress - STATEMENT_OVERLAY_FADE_START_PROGRESS) /
      (STATEMENT_OVERLAY_FADE_END_PROGRESS -
        STATEMENT_OVERLAY_FADE_START_PROGRESS),
  );
  const easedOverlayProgress =
    overlayProgress ** 2 * (3 - 2 * overlayProgress);

  return {
    progress: normalizedProgress,
    maskScale:
      STATEMENT_INITIAL_MASK_SCALE -
      (STATEMENT_INITIAL_MASK_SCALE - 1) * easedProgress,
    overlayOpacity: easedOverlayProgress,
  };
}

function createWheelGestureState() {
  return {
    accumulator: 0,
    direction: null,
    consumed: false,
    triggeredDirection: null,
    lastMagnitude: 0,
    minimumMagnitudeAfterTrigger: Number.POSITIVE_INFINITY,
    lastTriggerTime: Number.NEGATIVE_INFINITY,
  };
}

function advanceWheelGesture(state, deltaY, threshold = 32, eventTime = 0) {
  if (!Number.isFinite(deltaY) || deltaY === 0) {
    return {
      ...(state ?? createWheelGestureState()),
      triggeredDirection: null,
    };
  }

  const currentState = state ?? createWheelGestureState();
  const direction =
    deltaY > 0
      ? HOME_SCROLL_DIRECTIONS.DOWN
      : HOME_SCROLL_DIRECTIONS.UP;
  const magnitude = Math.abs(deltaY);

  if (currentState.consumed) {
    const sameDirection = currentState.direction === direction;
    const minimumMagnitudeAfterTrigger = sameDirection
      ? Math.min(currentState.minimumMagnitudeAfterTrigger, magnitude)
      : currentState.minimumMagnitudeAfterTrigger;
    const enoughTimePassed =
      eventTime - currentState.lastTriggerTime >= WHEEL_REARM_MIN_DELAY_MS;
    const directionChanged =
      !sameDirection && magnitude >= WHEEL_NEW_IMPULSE_MAGNITUDE_PX;
    const newSameDirectionImpulse =
      sameDirection &&
      minimumMagnitudeAfterTrigger <= WHEEL_DECAY_MAGNITUDE_PX &&
      magnitude >= WHEEL_NEW_IMPULSE_MAGNITUDE_PX &&
      magnitude >= currentState.lastMagnitude * WHEEL_NEW_IMPULSE_RATIO;

    if (!enoughTimePassed || (!directionChanged && !newSameDirectionImpulse)) {
      return {
        ...currentState,
        triggeredDirection: null,
        lastMagnitude: magnitude,
        minimumMagnitudeAfterTrigger,
      };
    }

    const consumed = magnitude >= threshold;

    return {
      accumulator: deltaY,
      direction,
      consumed,
      triggeredDirection: consumed ? direction : null,
      lastMagnitude: magnitude,
      minimumMagnitudeAfterTrigger: Number.POSITIVE_INFINITY,
      lastTriggerTime: consumed ? eventTime : currentState.lastTriggerTime,
    };
  }

  const accumulator =
    currentState.direction !== null && currentState.direction !== direction
      ? deltaY
      : currentState.accumulator + deltaY;
  const consumed = Math.abs(accumulator) >= threshold;

  return {
    accumulator,
    direction,
    consumed,
    triggeredDirection: consumed ? direction : null,
    lastMagnitude: magnitude,
    minimumMagnitudeAfterTrigger: Number.POSITIVE_INFINITY,
    lastTriggerTime: consumed ? eventTime : currentState.lastTriggerTime,
  };
}

function createHomeScrollState({
  panelIndex = 0,
  phase = HOME_SCROLL_PHASES.TITLE,
  entryDirection = null,
} = {}) {
  return { panelIndex, phase, entryDirection };
}

function getNextHomeScrollState(state, direction, panelCount) {
  if (
    !state ||
    !Number.isInteger(panelCount) ||
    panelCount <= 0 ||
    ![HOME_SCROLL_DIRECTIONS.UP, HOME_SCROLL_DIRECTIONS.DOWN].includes(
      direction,
    )
  ) {
    return state;
  }

  const isImageStep = state.phase === HOME_SCROLL_PHASES.IMAGE;
  const shouldRevealTitle =
    isImageStep &&
    (state.entryDirection === null || state.entryDirection === direction);

  if (shouldRevealTitle) {
    return createHomeScrollState({
      panelIndex: state.panelIndex,
      phase: HOME_SCROLL_PHASES.TITLE,
    });
  }

  const nextPanelIndex = state.panelIndex + direction;

  if (nextPanelIndex < 0 || nextPanelIndex >= panelCount) {
    return state;
  }

  return createHomeScrollState({
    panelIndex: nextPanelIndex,
    phase: HOME_SCROLL_PHASES.IMAGE,
    entryDirection: direction,
  });
}

function createScrollbarHomeScrollState(panelIndex, { settled = true } = {}) {
  return createHomeScrollState({
    panelIndex,
    phase: settled ? HOME_SCROLL_PHASES.TITLE : HOME_SCROLL_PHASES.IMAGE,
    entryDirection: null,
  });
}

function normalizeWheelDelta({ deltaX = 0, deltaY = 0, deltaMode = 0 }, viewportHeight) {
  const multiplier =
    deltaMode === 1
      ? WHEEL_LINE_HEIGHT_PX
      : deltaMode === 2
        ? Math.max(viewportHeight, 1)
        : 1;

  return {
    x: deltaX * multiplier,
    y: deltaY * multiplier,
  };
}

function getSwipeDirection(
  { startX, startY, endX, endY },
  { threshold = 48, verticalDominance = 1.2 } = {},
) {
  const horizontalDistance = endX - startX;
  const verticalDistance = startY - endY;

  if (
    Math.abs(verticalDistance) < threshold ||
    Math.abs(verticalDistance) < Math.abs(horizontalDistance) * verticalDominance
  ) {
    return null;
  }

  return verticalDistance > 0
    ? HOME_SCROLL_DIRECTIONS.DOWN
    : HOME_SCROLL_DIRECTIONS.UP;
}

function getKeyboardDirection({ key, shiftKey = false }) {
  if (key === "ArrowDown" || key === "PageDown" || (key === " " && !shiftKey)) {
    return HOME_SCROLL_DIRECTIONS.DOWN;
  }

  if (key === "ArrowUp" || key === "PageUp" || (key === " " && shiftKey)) {
    return HOME_SCROLL_DIRECTIONS.UP;
  }

  return null;
}

function getNearestPanelIndex(scrollTop, panelOffsets) {
  if (!Array.isArray(panelOffsets) || panelOffsets.length === 0) {
    return 0;
  }

  return panelOffsets.reduce((nearestIndex, offset, index) =>
    Math.abs(offset - scrollTop) <
    Math.abs(panelOffsets[nearestIndex] - scrollTop)
      ? index
      : nearestIndex,
  0);
}

export {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  advanceWheelGesture,
  clampHomeStatementProgress,
  createHomeScrollState,
  createScrollbarHomeScrollState,
  createWheelGestureState,
  getKeyboardDirection,
  getNearestPanelIndex,
  getNextHomeScrollState,
  getHomeStatementTravelDistance,
  getHomeStatementVisualState,
  getSwipeDirection,
  normalizeWheelDelta,
};
