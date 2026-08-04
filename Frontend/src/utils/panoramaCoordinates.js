export function getPanoramaOrientation(value) {
  const selection = value?.selection || value?.targetMetadata?.selection || value?.targetMetadata || value;
  const yaw = Number(selection?.yaw);
  const pitch = Number(selection?.pitch);
  if (Number.isFinite(yaw) && Number.isFinite(pitch)) return { yaw, pitch };

  const position = selection?.viewerPoint?.modelPosition;
  const x = Number(position?.x);
  const y = Number(position?.y);
  const z = Number(position?.z);
  const length = Math.hypot(x, y, z);
  if (!Number.isFinite(length) || length === 0) return null;
  return {
    yaw: Math.atan2(x, -z) * 180 / Math.PI,
    pitch: Math.asin(Math.min(Math.max(y / length, -1), 1)) * 180 / Math.PI,
  };
}

export function getPanoramaDirection(yawDegrees, pitchDegrees, radius = 1) {
  const yaw = Number(yawDegrees) * Math.PI / 180;
  const pitch = Number(pitchDegrees) * Math.PI / 180;
  if (![yaw, pitch, radius].every(Number.isFinite)) return null;
  return {
    x: Math.sin(yaw) * Math.cos(pitch) * radius,
    y: Math.sin(pitch) * radius,
    z: -Math.cos(yaw) * Math.cos(pitch) * radius,
  };
}
