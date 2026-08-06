export function getTooltipViewportOffset({
  bottom,
  left,
  margin = 8,
  right,
  top,
  viewportHeight,
  viewportWidth,
}) {
  let offsetX = 0;
  let offsetY = 0;

  if (left < margin) {
    offsetX = margin - left;
  } else if (right > viewportWidth - margin) {
    offsetX = viewportWidth - margin - right;
  }

  if (top < margin) {
    offsetY = margin - top;
  } else if (bottom > viewportHeight - margin) {
    offsetY = viewportHeight - margin - bottom;
  }

  return { offsetX, offsetY };
}
