import { query } from "../config/db.js";

const GENERAL_COMMENT_TYPE = "general";
const ACTIVE_COMMENT_STATUS = "active";

function toProjectComment(row) {
  const authorName = `${row.first_name || ""} ${row.last_name || ""}`.trim();

  return {
    author: {
      email: row.email,
      firstName: row.first_name,
      id: Number(row.user_id),
      lastName: row.last_name,
      name: authorName || row.email,
      profilePhotoUrl: row.profile_photo_url || null,
      roleCode: row.role_code,
    },
    content: row.content,
    createdAt: row.created_at,
    id: Number(row.id),
    parentCommentId: row.parent_comment_id
      ? Number(row.parent_comment_id)
      : null,
    projectId: Number(row.project_id),
    status: row.status,
    type: row.parent_comment_id ? "reply" : "comment",
    updatedAt: row.updated_at,
  };
}

function getProjectAccessCondition(user, projectAlias = "p") {
  const roleCode = user?.role?.code;

  if (roleCode === "admin") {
    return {
      params: [],
      sql: "true",
    };
  }

  if (roleCode === "architect") {
    return {
      params: [user.id],
      sql: `${projectAlias}.assigned_architect_id = $1`,
    };
  }

  if (roleCode === "client" && user.clientId) {
    return {
      params: [user.clientId],
      sql: `${projectAlias}.client_id = $1`,
    };
  }

  return {
    params: [],
    sql: "false",
  };
}

export async function canAccessProjectComments(projectId, user) {
  const access = getProjectAccessCondition(user);
  const result = await query(
    `
      select p.id
      from public.projects p
      where p.id = $${access.params.length + 1}
        and p.deleted_at is null
        and (${access.sql})
      limit 1
    `,
    [...access.params, projectId],
  );

  return Boolean(result.rows[0]);
}

export async function listGeneralProjectComments(projectId, user) {
  const access = getProjectAccessCondition(user);
  const result = await query(
    `
      select
        pc.id,
        pc.project_id,
        pc.user_id,
        pc.parent_comment_id,
        pc.content,
        pc.status,
        pc.created_at,
        pc.updated_at,
        u.email,
        u.first_name,
        u.last_name,
        u.profile_photo_url,
        r.code as role_code
      from public.project_comments pc
      inner join public.projects p
        on p.id = pc.project_id
      inner join public.users u
        on u.id = pc.user_id
      inner join public.roles r
        on r.id = u.role_id
      where pc.project_id = $${access.params.length + 1}
        and pc.comment_type = $${access.params.length + 2}::comment_type
        and pc.deleted_at is null
        and pc.status = $${access.params.length + 3}::comment_status
        and pc.file_id is null
        and pc.file_version_id is null
        and p.deleted_at is null
        and (${access.sql})
      order by coalesce(pc.parent_comment_id, pc.id) asc, pc.created_at asc, pc.id asc
    `,
    [...access.params, projectId, GENERAL_COMMENT_TYPE, ACTIVE_COMMENT_STATUS],
  );

  return result.rows.map(toProjectComment);
}

export async function createGeneralProjectComment({
  content,
  parentCommentId = null,
  projectId,
  user,
}) {
  const access = getProjectAccessCondition(user);
  const params = [
    ...access.params,
    projectId,
    user.id,
    parentCommentId,
    content,
    GENERAL_COMMENT_TYPE,
    ACTIVE_COMMENT_STATUS,
  ];
  const projectIdParam = access.params.length + 1;
  const userIdParam = access.params.length + 2;
  const parentIdParam = access.params.length + 3;
  const contentParam = access.params.length + 4;
  const typeParam = access.params.length + 5;
  const statusParam = access.params.length + 6;

  const result = await query(
    `
      with accessible_project as (
        select p.id
        from public.projects p
        where p.id = $${projectIdParam}
          and p.deleted_at is null
          and (${access.sql})
        limit 1
      ),
      parent_comment as (
        select pc.id
        from public.project_comments pc
        where pc.id = $${parentIdParam}
          and pc.project_id = $${projectIdParam}
          and pc.deleted_at is null
          and pc.status = $${statusParam}::comment_status
          and pc.comment_type = $${typeParam}::comment_type
          and pc.parent_comment_id is null
          and pc.file_id is null
          and pc.file_version_id is null
      ),
      inserted_comment as (
        insert into public.project_comments (
          project_id,
          user_id,
          parent_comment_id,
          comment_type,
          content,
          status
        )
        select
          ap.id,
          $${userIdParam},
          case
            when $${parentIdParam}::bigint is null then null
            else pc.id
          end,
          $${typeParam}::comment_type,
          $${contentParam},
          $${statusParam}::comment_status
        from accessible_project ap
        left join parent_comment pc on true
        where $${parentIdParam}::bigint is null or pc.id is not null
        returning *
      )
      select
        ic.id,
        ic.project_id,
        ic.user_id,
        ic.parent_comment_id,
        ic.content,
        ic.status,
        ic.created_at,
        ic.updated_at,
        u.email,
        u.first_name,
        u.last_name,
        u.profile_photo_url,
        r.code as role_code
      from inserted_comment ic
      inner join public.users u
        on u.id = ic.user_id
      inner join public.roles r
        on r.id = u.role_id
    `,
    params,
  );

  return result.rows[0] ? toProjectComment(result.rows[0]) : null;
}
