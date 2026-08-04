export function getObservationAuthorInitials(authorName) {
  const parts = String(authorName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function formatObservationReplyCount(replyCount) {
  const count = Math.max(0, Number(replyCount) || 0);
  return `${count} ${count === 1 ? "respuesta" : "respuestas"}`;
}

export function getAdaptiveObservationTooltipPlacement({
  anchorBottom,
  anchorTop,
  anchorX,
  tooltipHeight,
  tooltipWidth,
  viewportHeight,
  viewportWidth,
}) {
  const margin = 12;
  const gap = 12;
  const width = Math.max(1, tooltipWidth || 210);
  const height = Math.max(1, tooltipHeight || 128);
  const availableAbove = anchorTop - margin;
  const availableBelow = viewportHeight - anchorBottom - margin;
  const placement = availableAbove >= height + gap || availableAbove >= availableBelow
    ? "top"
    : "bottom";
  const left = Math.min(
    Math.max(anchorX - width / 2, margin),
    Math.max(margin, viewportWidth - width - margin),
  );
  const top = placement === "top"
    ? Math.max(margin, anchorTop - height - gap)
    : Math.min(viewportHeight - height - margin, anchorBottom + gap);

  return {
    left,
    placement,
    tailLeft: Math.min(Math.max(anchorX - left, 18), width - 18),
    top,
  };
}
