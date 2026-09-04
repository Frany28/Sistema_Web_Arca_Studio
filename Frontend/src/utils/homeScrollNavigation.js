const HOME_SCROLL_PHASES = Object.freeze({
  IMAGE: "image",
  TITLE: "title",
});

const HOME_SCROLL_DIRECTIONS = Object.freeze({
  UP: -1,
  DOWN: 1,
});

const WHEEL_LINE_HEIGHT_PX = 16;

function createWheelGestureState() {
  return {
    accumulator: 0,
    direction: null,
    consumed: false,
    triggeredDirection: null,
  };
}

function advanceWheelGesture(state, deltaY, threshold = 32) {
  if (!state || state.consumed || !Number.isFinite(deltaY) || deltaY === 0) {
    return {
      ...(state ?? createWheelGestureState()),
      triggeredDirection: null,
    };
  }

  const direction =
    deltaY > 0
      ? HOME_SCROLL_DIRECTIONS.DOWN
      : HOME_SCROLL_DIRECTIONS.UP;
  const accumulator =
    state.direction !== null && state.direction !== direction
      ? deltaY
      : state.accumulator + deltaY;
  const consumed = Math.abs(accumulator) >= threshold;

  return {
    accumulator,
    direction,
    consumed,
    triggeredDirection: consumed ? direction : null,
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

function createScrollbarHomeScrollState(panelIndex) {
  return createHomeScrollState({
    panelIndex,
    phase: HOME_SCROLL_PHASES.IMAGE,
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
  advanceWheelGesture,
  createHomeScrollState,
  createScrollbarHomeScrollState,
  createWheelGestureState,
  getKeyboardDirection,
  getNearestPanelIndex,
  getNextHomeScrollState,
  getSwipeDirection,
  normalizeWheelDelta,
};
