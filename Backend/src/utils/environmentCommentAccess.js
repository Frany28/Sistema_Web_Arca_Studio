export function getEnvironmentCommentAccess(
  user,
  { projectAlias = "shared_project", roleAlias = "scope_role", userAlias = "scope_user" } = {},
) {
  const roleCode = user?.role?.code;

  if (roleCode === "admin") {
    return { params: [], sql: "true" };
  }

  const selfUserId = Number(user?.id);
  const isArchitect = roleCode === "architect";
  const isClient = roleCode === "client" && Number(user?.clientId) > 0;

  if (!Number.isInteger(selfUserId) || selfUserId <= 0 || (!isArchitect && !isClient)) {
    return { params: [], sql: "false" };
  }

  const params = isArchitect
    ? [selfUserId]
    : [selfUserId, Number(user.clientId)];
  const viewerMembership = isArchitect
    ? `${projectAlias}.assigned_architect_id = $1`
    : `${projectAlias}.client_id = $2`;

  return {
    params,
    sql: `(
      ${userAlias}.id = $1
      or exists (
        select 1
        from public.projects ${projectAlias}
        where ${projectAlias}.deleted_at is null
          and ${projectAlias}.status <> 'cancelled'::project_status
          and (${viewerMembership})
          and (
            (${roleAlias}.code = 'architect' and ${projectAlias}.assigned_architect_id = ${userAlias}.id)
            or (
              ${roleAlias}.code = 'client'
              and ${userAlias}.client_id is not null
              and ${projectAlias}.client_id = ${userAlias}.client_id
            )
          )
      )
    )`,
  };
}
