import { useMemo } from "react";

import { useAuth } from "../auth/AuthContext.jsx";
import { useEnvironmentComments } from "../hooks/useProjectComments.js";
import { getEnvironmentNotificationsPolicy } from "../utils/observationAccess.js";
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
  const policy = getEnvironmentNotificationsPolicy(user, { activityOnly });
  const {
    drawerComments: environmentComments,
    error: environmentCommentsError,
    loading: environmentCommentsLoading,
    refresh: refreshEnvironmentComments,
    submitComment: submitEnvironmentComment,
  } = useEnvironmentComments({
    enabled: open && policy.observationsAllowed,
    refreshIntervalMs: open ? 15000 : 0,
    user,
  });
  const mergedComments = useMemo(
    () => policy.observationsAllowed
      ? mergeDrawerComments(environmentComments, comments)
      : [],
    [comments, environmentComments, policy.observationsAllowed],
  );

  return (
    <NotificationsDrawer
      {...props}
      activityOnly={policy.activityOnly}
      open={open}
      comments={mergedComments}
      commentsError={
        policy.observationsAllowed
          ? environmentCommentsError || commentsError
          : ""
      }
      commentsLoading={
        policy.observationsAllowed
          ? environmentCommentsLoading || commentsLoading
          : false
      }
      onRefreshComments={
        policy.observationsAllowed
          ? () => Promise.all([
              refreshEnvironmentComments(),
              onRefreshComments?.(),
            ])
          : undefined
      }
      onSubmitComment={policy.observationsAllowed ? onSubmitComment : undefined}
      onSubmitEnvironmentComment={
        policy.observationsAllowed ? submitEnvironmentComment : undefined
      }
    />
  );
}

export default EnvironmentNotificationsDrawer;
