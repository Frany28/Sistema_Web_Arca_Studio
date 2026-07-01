import { query } from "../config/db.js";

const GENERAL_COMMENT_TYPE = "general";
const ACTIVE_COMMENT_STATUS = "active";

function toProjectComment(row) {
  const authorName = `${row.first_name || ""} ${row.last_name || ""}`.trim();
  const targetMetadata = row.target_metadata || null;
  const commentType = row.comment_type || GENERAL_COMMENT_TYPE;

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
    commentType,
    content: row.content,
    createdAt: row.created_at,
    id: Number(row.id),
    image: targetMetadata?.image || null,
    imageComment: ["image", "viewer3d", "video"].includes(commentType),
    parentCommentId: row.parent_comment_id
      ? Number(row.parent_comment_id)
      : null,
    pointNumber:
      Number(targetMetadata?.pointNumber ?? targetMetadata?.point_number) ||
      null,
    projectId: Number(row.project_id),
    selection: targetMetadata?.selection || null,
    status: row.status,
    targetId: row.target_id || null,
    targetMetadata,
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

export async function listProjectComments(projectId, user) {
  const access = getProjectAccessCondition(user);
  const result = await query(
    `
      select
        pc.id,
        pc.project_id,
        pc.user_id,
        pc.parent_comment_id,
        pc.comment_type,
        pc.content,
        pc.target_id,
        pc.target_metadata,
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
        and pc.deleted_at is null
        and pc.status = $${access.params.length + 2}::comment_status
        and pc.file_id is null
        and pc.file_version_id is null
        and p.deleted_at is null
        and (${access.sql})
      order by coalesce(pc.parent_comment_id, pc.id) asc, pc.created_at asc, pc.id asc
    `,
    [...access.params, projectId, ACTIVE_COMMENT_STATUS],
  );

  return result.rows.map(toProjectComment);
}

export async function createProjectCommentRecord({
  commentType = GENERAL_COMMENT_TYPE,
  content,
  parentCommentId = null,
  projectId,
  targetId = null,
  targetMetadata = null,
  user,
}) {
  const access = getProjectAccessCondition(user);
  const params = [
    ...access.params,
    projectId,
    user.id,
    parentCommentId,
    content,
    commentType,
    ACTIVE_COMMENT_STATUS,
    targetId,
    targetMetadata,
  ];
  const projectIdParam = access.params.length + 1;
  const userIdParam = access.params.length + 2;
  const parentIdParam = access.params.length + 3;
  const contentParam = access.params.length + 4;
  const typeParam = access.params.length + 5;
  const statusParam = access.params.length + 6;
  const targetIdParam = access.params.length + 7;
  const targetMetadataParam = access.params.length + 8;

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
        select
          coalesce(parent_pc.id, pc.id) as id,
          coalesce(parent_pc.comment_type, pc.comment_type) as comment_type,
          coalesce(parent_pc.target_id, pc.target_id) as target_id,
          coalesce(parent_pc.target_metadata, pc.target_metadata) as target_metadata
        from public.project_comments pc
        left join public.project_comments parent_pc
          on parent_pc.id = pc.parent_comment_id
          and parent_pc.project_id = pc.project_id
          and parent_pc.deleted_at is null
          and parent_pc.status = $${statusParam}::comment_status
          and parent_pc.file_id is null
          and parent_pc.file_version_id is null
        where pc.id = $${parentIdParam}
          and pc.project_id = $${projectIdParam}
          and pc.deleted_at is null
          and pc.status = $${statusParam}::comment_status
          and pc.file_id is null
          and pc.file_version_id is null
      ),
      target_point_number as (
        select count(*) + 1 as point_number
        from public.project_comments existing_pc
        where existing_pc.project_id = $${projectIdParam}
          and existing_pc.parent_comment_id is null
          and existing_pc.comment_type = $${typeParam}::comment_type
          and existing_pc.target_id is not distinct from $${targetIdParam}::text
          and existing_pc.deleted_at is null
          and existing_pc.status = $${statusParam}::comment_status
          and existing_pc.file_id is null
          and existing_pc.file_version_id is null
      ),
      inserted_comment as (
        insert into public.project_comments (
          project_id,
          user_id,
          parent_comment_id,
          comment_type,
          content,
          target_id,
          target_metadata,
          status
        )
        select
          ap.id,
          $${userIdParam},
          case
            when $${parentIdParam}::bigint is null then null
            else pc.id
          end,
          case
            when $${parentIdParam}::bigint is null then $${typeParam}::comment_type
            else pc.comment_type
          end,
          $${contentParam},
          case
            when $${parentIdParam}::bigint is null then $${targetIdParam}::text
            else pc.target_id
          end,
          case
            when $${parentIdParam}::bigint is null and $${typeParam}::comment_type = 'general'::comment_type then null
            when $${parentIdParam}::bigint is null then jsonb_set(
              coalesce($${targetMetadataParam}::jsonb, '{}'::jsonb),
              '{pointNumber}',
              to_jsonb(tpn.point_number),
              true
            )
            else pc.target_metadata
          end,
          $${statusParam}::comment_status
        from accessible_project ap
        left join parent_comment pc on true
        cross join target_point_number tpn
        where $${parentIdParam}::bigint is null or pc.id is not null
        returning *
      )
      select
        ic.id,
        ic.project_id,
        ic.user_id,
        ic.parent_comment_id,
        ic.comment_type,
        ic.content,
        ic.target_id,
        ic.target_metadata,
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
