export function getVideoThumbnailTime(duration) {
  const safeDuration = Number(duration);

  if (!Number.isFinite(safeDuration) || safeDuration <= 0) return 0;
  if (safeDuration < 0.2) return safeDuration / 2;

  return Math.min(Math.max(safeDuration * 0.1, 0.1), 5);
}
