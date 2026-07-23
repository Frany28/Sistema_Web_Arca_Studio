import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/http.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { decorateCommentForDisplay } from "../utils/commentDisplay.js";

function upsert(comments, comment) {
  return comments.some((item) => String(item.id) === String(comment.id))
    ? comments.map((item) => String(item.id) === String(comment.id) ? comment : item)
    : [...comments, comment];
}

export function useDocumentComments({ enabled, fileId, fileVersionId, projectId }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!enabled || !projectId || !fileId || !fileVersionId) {
      return undefined;
    }
    let mounted = true;
    api.projects.listAllDocumentComments({ fileId, fileVersionId, projectId })
      .then((data) => mounted && setRows(data.comments || []))
      .catch(() => mounted && setRows([]));
    return () => { mounted = false; };
  }, [enabled, fileId, fileVersionId, projectId]);

  const comments = useMemo(
    () => rows.map((comment) => ({
      ...decorateCommentForDisplay(comment, user),
      imageComment: true,
      message: comment.content,
      timestamp: "",
    })),
    [rows, user],
  );

  const addComment = useCallback(async ({ message, parentCommentId = null, selection = null }) => {
    const data = await api.projects.createComment({
      commentType: "document",
      content: message,
      fileId,
      fileVersionId,
      parentCommentId,
      projectId,
      selection,
    });
    if (data.comment) setRows((current) => upsert(current, data.comment));
    return data.comment || null;
  }, [fileId, fileVersionId, projectId]);

  return { addComment, comments };
}
