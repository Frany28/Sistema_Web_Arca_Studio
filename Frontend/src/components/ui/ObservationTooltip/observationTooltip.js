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
