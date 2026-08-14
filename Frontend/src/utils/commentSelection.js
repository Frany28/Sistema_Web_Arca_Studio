export function getToggledCommentId(currentCommentId, selectedCommentId) {
  return String(currentCommentId) === String(selectedCommentId)
    ? null
    : selectedCommentId;
}
