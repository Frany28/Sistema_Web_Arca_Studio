import { useMemo } from "react";

import { useAuth } from "../auth/AuthContext.jsx";
import { useEnvironmentComments } from "../hooks/useProjectComments.js";
import NotificationsDrawer from "./ui/NotificationsDrawer.jsx";

function mergeDrawerComments(environmentComments, projectComments) {
  const commentsById = new Map();

  [...environmentComments, ...projectComments].forEach((comment) => {
    if (comment?.id !== undefined && comment?.id !== null) {
      commentsById.set(String(comment.id), comment);
    }
  });

  return Array.from(commentsById.values());
}

function EnvironmentNotificationsDrawer({
  activityOnly = false,
  comments = [],
  commentsError = "",
  commentsLoading = false,
  onRefreshComments,
  onSubmitComment,
  open = false,
  ...props
}) {
  const { user } = useAuth();
  const {
    drawerComments: environmentComments,
    error: environmentCommentsError,
    loading: environmentCommentsLoading,
    refresh: refreshEnvironmentComments,
    submitComment: submitEnvironmentComment,
  } = useEnvironmentComments({
    enabled: open && !activityOnly,
    refreshIntervalMs: open ? 15000 : 0,
    user,
  });
  const mergedComments = useMemo(
    () => mergeDrawerComments(environmentComments, comments),
    [comments, environmentComments],
  );

  return (
    <NotificationsDrawer
      {...props}
      activityOnly={activityOnly}
      open={open}
      comments={mergedComments}
      commentsError={environmentCommentsError || commentsError}
      commentsLoading={environmentCommentsLoading || commentsLoading}
      onRefreshComments={() =>
        Promise.all([
          refreshEnvironmentComments(),
          onRefreshComments?.(),
        ])
      }
      onSubmitComment={onSubmitComment}
      onSubmitEnvironmentComment={submitEnvironmentComment}
    />
  );
}

export default EnvironmentNotificationsDrawer;
