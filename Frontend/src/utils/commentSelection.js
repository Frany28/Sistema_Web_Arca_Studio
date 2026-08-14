export function getToggledCommentId(currentCommentId, selectedCommentId) {
  return String(currentCommentId) === String(selectedCommentId)
    ? null
    : selectedCommentId;
}

export function getCommentNavigationParams(comment) {
  const isDocument = comment?.commentType === "document";
  const params = new URLSearchParams({ tab: isDocument ? "documents" : "renders" });

  if (isDocument && comment?.fileId) {
    params.set("fileId", String(comment.fileId));
  } else if (comment?.imageId) {
    params.set("imageId", String(comment.imageId));
  }

  if (comment?.id) {
    params.set("commentId", String(comment.id));
  }

  return params;
}
