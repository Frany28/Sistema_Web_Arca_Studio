const DEFAULT_DEADZONE = 0.18;

function normalizeAxis(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(-1, Math.min(1, number)) : 0;
}

export function applyGamepadDeadzone(value, deadzone = DEFAULT_DEADZONE) {
  const axis = normalizeAxis(value);
  const magnitude = Math.abs(axis);

  if (magnitude <= deadzone) {
    return 0;
  }

  return (
    Math.sign(axis) *
    Math.min(1, (magnitude - deadzone) / Math.max(1 - deadzone, 0.01))
  );
}

function getStrongestAxisPair(axes = []) {
  const pairs = [
    [axes[2], axes[3]],
    [axes[0], axes[1]],
  ].map(([x, y]) => ({
    magnitude: Math.hypot(normalizeAxis(x), normalizeAxis(y)),
    x: normalizeAxis(x),
    y: normalizeAxis(y),
  }));

  return pairs.reduce(
    (strongest, pair) =>
      pair.magnitude > strongest.magnitude ? pair : strongest,
    { magnitude: 0, x: 0, y: 0 },
  );
}

export function getXRMovementAxes(inputSources = []) {
  const sources = Array.from(inputSources).filter(
    (source) => source?.gamepad?.axes,
  );
  const orderedSources = [
    ...sources.filter((source) => source.handedness === "left"),
    ...sources.filter((source) => source.handedness !== "left"),
  ];

  for (const source of orderedSources) {
    const pair = getStrongestAxisPair(source.gamepad.axes);
    const x = applyGamepadDeadzone(pair.x);
    const y = applyGamepadDeadzone(pair.y);

    if (x || y) {
      return { x, y };
    }
  }

  return { x: 0, y: 0 };
}

export function getXRHandedAxes(inputSources = [], handedness) {
  const source = Array.from(inputSources).find(
    (item) => item?.handedness === handedness && item?.gamepad?.axes,
  );
  const pair = getStrongestAxisPair(source?.gamepad?.axes);

  return {
    x: applyGamepadDeadzone(pair.x),
    y: applyGamepadDeadzone(pair.y),
  };
}

export function getSnapTurnState(
  axis,
  latched = false,
  { releaseThreshold = 0.3, turnThreshold = 0.72 } = {},
) {
  const normalizedAxis = normalizeAxis(axis);

  if (latched) {
    return {
      direction: 0,
      latched: Math.abs(normalizedAxis) > releaseThreshold,
    };
  }

  if (Math.abs(normalizedAxis) < turnThreshold) {
    return { direction: 0, latched: false };
  }

  return {
    direction: normalizedAxis > 0 ? -1 : 1,
    latched: true,
  };
}
