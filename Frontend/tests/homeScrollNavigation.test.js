import assert from "node:assert/strict";
import test from "node:test";

import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  advanceWheelGesture,
  createHomeScrollState,
  createScrollbarHomeScrollState,
  createWheelGestureState,
  getKeyboardDirection,
  getHomeStatementTravelDistance,
  getHomeStatementVisualState,
  getNearestPanelIndex,
  getNextHomeScrollState,
  getSwipeDirection,
  limitHomeStatementWheelDelta,
  normalizeWheelDelta,
} from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";

const { UP, DOWN } = HOME_SCROLL_DIRECTIONS;
const { IMAGE, TITLE } = HOME_SCROLL_PHASES;

test("descending navigation alternates the next image and its title", () => {
  let state = createHomeScrollState();

  assert.deepEqual(state, { panelIndex: 0, phase: TITLE, entryDirection: null });

  state = getNextHomeScrollState(state, DOWN, 3);
  assert.deepEqual(state, { panelIndex: 1, phase: IMAGE, entryDirection: DOWN });

  state = getNextHomeScrollState(state, DOWN, 3);
  assert.deepEqual(state, { panelIndex: 1, phase: TITLE, entryDirection: null });

  state = getNextHomeScrollState(state, DOWN, 3);
  assert.deepEqual(state, { panelIndex: 2, phase: IMAGE, entryDirection: DOWN });

  state = getNextHomeScrollState(state, DOWN, 3);
  assert.deepEqual(state, { panelIndex: 2, phase: TITLE, entryDirection: null });

  assert.equal(getNextHomeScrollState(state, DOWN, 3), state);
});

test("ascending navigation uses the same image then title sequence", () => {
  let state = createHomeScrollState({ panelIndex: 2, phase: TITLE });

  state = getNextHomeScrollState(state, UP, 3);
  assert.deepEqual(state, { panelIndex: 1, phase: IMAGE, entryDirection: UP });

  state = getNextHomeScrollState(state, UP, 3);
  assert.deepEqual(state, { panelIndex: 1, phase: TITLE, entryDirection: null });

  state = getNextHomeScrollState(state, UP, 3);
  assert.deepEqual(state, { panelIndex: 0, phase: IMAGE, entryDirection: UP });

  state = getNextHomeScrollState(state, UP, 3);
  assert.deepEqual(state, { panelIndex: 0, phase: TITLE, entryDirection: null });

  assert.equal(getNextHomeScrollState(state, UP, 3), state);
});

test("reversing on a newly entered image changes panel without revealing it", () => {
  const enteredDown = createHomeScrollState({
    panelIndex: 1,
    phase: IMAGE,
    entryDirection: DOWN,
  });
  const enteredUp = createHomeScrollState({
    panelIndex: 1,
    phase: IMAGE,
    entryDirection: UP,
  });

  assert.deepEqual(getNextHomeScrollState(enteredDown, UP, 3), {
    panelIndex: 0,
    phase: IMAGE,
    entryDirection: UP,
  });
  assert.deepEqual(getNextHomeScrollState(enteredUp, DOWN, 3), {
    panelIndex: 2,
    phase: IMAGE,
    entryDirection: DOWN,
  });
});

test("a settled scrollbar selection reveals its title immediately", () => {
  const state = createScrollbarHomeScrollState(1);

  assert.deepEqual(state, {
    panelIndex: 1,
    phase: TITLE,
    entryDirection: null,
  });
  assert.deepEqual(getNextHomeScrollState(state, DOWN, 3), {
    panelIndex: 2,
    phase: IMAGE,
    entryDirection: DOWN,
  });
  assert.deepEqual(getNextHomeScrollState(state, UP, 3), {
    panelIndex: 0,
    phase: IMAGE,
    entryDirection: UP,
  });
});

test("the fourth panel is entered as an image before its special effect", () => {
  const interiorTitle = createHomeScrollState({
    panelIndex: 2,
    phase: TITLE,
  });
  const statementImage = getNextHomeScrollState(interiorTitle, DOWN, 4);

  assert.deepEqual(statementImage, {
    panelIndex: 3,
    phase: IMAGE,
    entryDirection: DOWN,
  });
  assert.deepEqual(getNextHomeScrollState(statementImage, UP, 4), {
    panelIndex: 2,
    phase: IMAGE,
    entryDirection: UP,
  });
  assert.deepEqual(createScrollbarHomeScrollState(3), {
    panelIndex: 3,
    phase: TITLE,
    entryDirection: null,
  });
});

test("a scrollbar drag hides the title until the selection settles", () => {
  assert.deepEqual(createScrollbarHomeScrollState(1, { settled: false }), {
    panelIndex: 1,
    phase: IMAGE,
    entryDirection: null,
  });
});

test("wheel deltas normalize pixel, line and page units", () => {
  assert.deepEqual(
    normalizeWheelDelta({ deltaX: 2, deltaY: -4, deltaMode: 0 }, 800),
    { x: 2, y: -4 },
  );
  assert.deepEqual(
    normalizeWheelDelta({ deltaX: 1, deltaY: 3, deltaMode: 1 }, 800),
    { x: 16, y: 48 },
  );
  assert.deepEqual(
    normalizeWheelDelta({ deltaX: 0, deltaY: 1, deltaMode: 2 }, 800),
    { x: 0, y: 800 },
  );
});

test("statement wheel deltas cap trackpad spikes without changing direction", () => {
  assert.equal(limitHomeStatementWheelDelta(18), 18);
  assert.equal(limitHomeStatementWheelDelta(120), 48);
  assert.equal(limitHomeStatementWheelDelta(-120), -48);
  assert.equal(limitHomeStatementWheelDelta(Number.NaN), 0);
});

test("a trackpad burst triggers one step and consumes its inertia", () => {
  let gesture = createWheelGestureState();

  gesture = advanceWheelGesture(gesture, 8);
  assert.equal(gesture.triggeredDirection, null);
  gesture = advanceWheelGesture(gesture, 10);
  assert.equal(gesture.triggeredDirection, null);
  gesture = advanceWheelGesture(gesture, 15);
  assert.equal(gesture.triggeredDirection, DOWN);

  gesture = advanceWheelGesture(gesture, 80);
  assert.equal(gesture.triggeredDirection, null);
  assert.equal(gesture.consumed, true);

  gesture = createWheelGestureState();
  gesture = advanceWheelGesture(gesture, -40);
  assert.equal(gesture.triggeredDirection, UP);
});

test("trackpad direction changes reset an incomplete accumulator", () => {
  let gesture = advanceWheelGesture(createWheelGestureState(), 20);

  gesture = advanceWheelGesture(gesture, -20);
  assert.equal(gesture.accumulator, -20);
  assert.equal(gesture.triggeredDirection, null);
});

test("a new trackpad impulse rearms after the previous inertia decays", () => {
  let gesture = createWheelGestureState();

  gesture = advanceWheelGesture(gesture, 18, 32, 0);
  gesture = advanceWheelGesture(gesture, 18, 32, 20);
  assert.equal(gesture.triggeredDirection, DOWN);

  gesture = advanceWheelGesture(gesture, 12, 32, 70);
  gesture = advanceWheelGesture(gesture, 7, 32, 120);
  gesture = advanceWheelGesture(gesture, 3, 32, 190);
  assert.equal(gesture.triggeredDirection, null);

  gesture = advanceWheelGesture(gesture, 14, 32, 280);
  assert.equal(gesture.triggeredDirection, null);
  assert.equal(gesture.consumed, false);

  gesture = advanceWheelGesture(gesture, 20, 32, 300);
  assert.equal(gesture.triggeredDirection, DOWN);
});

test("trackpad inertia cannot rearm without decaying first", () => {
  let gesture = advanceWheelGesture(createWheelGestureState(), 40, 32, 0);

  gesture = advanceWheelGesture(gesture, 18, 32, 250);
  gesture = advanceWheelGesture(gesture, 14, 32, 300);
  gesture = advanceWheelGesture(gesture, 11, 32, 350);

  assert.equal(gesture.triggeredDirection, null);
  assert.equal(gesture.consumed, true);
});

test("an intentional opposite trackpad gesture rearms after the lock window", () => {
  let gesture = advanceWheelGesture(createWheelGestureState(), 40, 32, 0);

  gesture = advanceWheelGesture(gesture, -14, 32, 240);
  assert.equal(gesture.consumed, false);
  assert.equal(gesture.triggeredDirection, null);

  gesture = advanceWheelGesture(gesture, -20, 32, 260);
  assert.equal(gesture.triggeredDirection, UP);
});

test("touch gestures require distance and vertical dominance", () => {
  assert.equal(
    getSwipeDirection({ startX: 100, startY: 160, endX: 105, endY: 90 }),
    DOWN,
  );
  assert.equal(
    getSwipeDirection({ startX: 100, startY: 90, endX: 95, endY: 160 }),
    UP,
  );
  assert.equal(
    getSwipeDirection({ startX: 100, startY: 100, endX: 102, endY: 70 }),
    null,
  );
  assert.equal(
    getSwipeDirection({ startX: 100, startY: 100, endX: 170, endY: 45 }),
    null,
  );
});

test("keyboard controls map to the shared navigation directions", () => {
  assert.equal(getKeyboardDirection({ key: "ArrowDown" }), DOWN);
  assert.equal(getKeyboardDirection({ key: "PageDown" }), DOWN);
  assert.equal(getKeyboardDirection({ key: " " }), DOWN);
  assert.equal(getKeyboardDirection({ key: "ArrowUp" }), UP);
  assert.equal(getKeyboardDirection({ key: "PageUp" }), UP);
  assert.equal(getKeyboardDirection({ key: " ", shiftKey: true }), UP);
  assert.equal(getKeyboardDirection({ key: "Enter" }), null);
});

test("scrollbar alignment selects the closest panel", () => {
  const offsets = [0, 800, 1600];

  assert.equal(getNearestPanelIndex(0, offsets), 0);
  assert.equal(getNearestPanelIndex(620, offsets), 1);
  assert.equal(getNearestPanelIndex(1500, offsets), 2);
  assert.equal(getNearestPanelIndex(900, offsets), 1);
});

test("statement progress follows scroll deltas and reverses from any point", () => {
  const downProgress = advanceHomeStatementProgress(0, 100, 1000);
  const reversedProgress = advanceHomeStatementProgress(
    downProgress,
    -50,
    1000,
  );

  assert.equal(downProgress, 1 / 3);
  assert.equal(reversedProgress, 1 / 6);
  assert.equal(advanceHomeStatementProgress(0.9, 100, 1000), 1);
  assert.equal(advanceHomeStatementProgress(0.1, -100, 1000), 0);
});

test("statement travel distance stays fast and responsive", () => {
  assert.equal(getHomeStatementTravelDistance(400), 200);
  assert.equal(getHomeStatementTravelDistance(900), 270);
  assert.equal(getHomeStatementTravelDistance(1400), 320);
});

test("reduced motion keeps statement endpoints without intermediate zoom", () => {
  assert.equal(advanceHomeStatementProgress(0.4, 1, 900, true), 1);
  assert.equal(advanceHomeStatementProgress(0.6, -1, 900, true), 0);
});

test("statement visual state zooms out through the solid black surround", () => {
  assert.deepEqual(getHomeStatementVisualState(0), {
    progress: 0,
    maskScale: 1000,
  });
  assert.deepEqual(getHomeStatementVisualState(1), {
    progress: 1,
    maskScale: 1,
  });
  assert.equal(getHomeStatementVisualState(0.5).maskScale, 500.5);
  assert.ok(getHomeStatementVisualState(0.05).maskScale > 992);
});
