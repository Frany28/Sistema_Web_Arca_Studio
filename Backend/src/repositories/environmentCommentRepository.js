import { query } from "../config/db.js";
import { getEnvironmentCommentAccess } from "../utils/environmentCommentAccess.js";
import { pageResult } from "../utils/pagination.js";

/**
 * Transforma el comentario de entorno a la representación pública esperada.
 * Consulta o modifica PostgreSQL mediante parámetros y devuelve una representación estable.
 *
 * @param {unknown} row - Fila obtenida desde PostgreSQL.
 * @returns {object} Resultado producido por la operación.
 */
function toEnvironmentComment(row) {
  const authorName = `${row.first_name || ""} ${row.last_name || ""}`.trim();

  return {
    author: {
      hasProfilePhoto: Boolean(row.has_profile_photo),
      id: Number(row.user_id),
      name: authorName || "Usuario",
      roleCode: row.role_code,
    },
    commentType: "general",
    content: row.content,
    createdAt: row.created_at,
    id: Number(row.id),
    parentCommentId: row.parent_comment_id
      ? Number(row.parent_comment_id)
      : null,
    projectId: null,
    scope: "environment",
    type: row.parent_comment_id ? "reply" : "comment",
  };
}

/**
 * Lista los comentarios de entorno respetando el alcance y la paginación solicitados.
 * Consulta o modifica PostgreSQL mediante parámetros y devuelve una representación estable.
 *
 * @param {unknown} user - Usuario autenticado que ejecuta la operación.
 * @param {object} [options] - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} [options.cursor] - Valor de `options.cursor` requerido por esta operación.
 * @param {number} [options.limit] - Valor de `options.limit` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 */
export async function listEnvironmentComments(
  user,
  { cursor = null, limit = 25 } = {},
) {
  const access = getEnvironmentCommentAccess(user);
  const cursorDateParam = access.params.length + 1;
  const cursorIdParam = access.params.length + 2;
  const limitParam = access.params.length + 3;
  const result = await query(
    `
      select
        ec.id,
        ec.user_id,
        ec.parent_comment_id,
        ec.content,
        ec.created_at,
        u.first_name,
        u.last_name,
        (u.profile_photo_url is not null) as has_profile_photo,
        r.code as role_code
      from public.environment_comments ec
      inner join public.users u
        on u.id = ec.user_id
       and u.deleted_at is null
      inner join public.roles r
        on r.id = u.role_id
       and r.is_active = true
      left join public.environment_comments root_comment
        on root_comment.id = ec.parent_comment_id
       and root_comment.deleted_at is null
       and root_comment.status = 'active'::comment_status
      inner join public.users scope_user
        on scope_user.id = coalesce(root_comment.user_id, ec.user_id)
       and scope_user.deleted_at is null
      inner join public.roles scope_role
        on scope_role.id = scope_user.role_id
       and scope_role.is_active = true
      where (ec.parent_comment_id is null or root_comment.id is not null)
        and ec.deleted_at is null
        and ec.status = 'active'::comment_status
        and (${access.sql})
        and ($${cursorDateParam}::timestamptz is null or (ec.created_at, ec.id) > ($${cursorDateParam}::timestamptz, $${cursorIdParam}::bigint))
      order by ec.created_at asc, ec.id asc
      limit $${limitParam}
    `,
    [...access.params, cursor?.[0] || null, cursor?.[1] || null, limit + 1],
  );

  return pageResult(
    result.rows,
    limit,
    toEnvironmentComment,
    (row) => [row.created_at, String(row.id)],
  );
}

/**
 * Crea el comentario de entorno con los datos validados recibidos.
 * Consulta o modifica PostgreSQL mediante parámetros y devuelve una representación estable.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.content - Valor de `options.content` requerido por esta operación.
 * @param {string} [options.parentCommentId] - Valor de `options.parentCommentId` requerido por esta operación.
 * @param {unknown} options.user - Valor de `options.user` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 */
export async function createEnvironmentComment({
  content,
  parentCommentId = null,
  user,
}) {
  const access = getEnvironmentCommentAccess(user);
  const parentIdParam = access.params.length + 1;
  const userIdParam = access.params.length + 2;
  const contentParam = access.params.length + 3;
  const result = await query(
    `
      with parent_comment as (
        select coalesce(root_comment.id, child.id) as id
        from public.environment_comments child
        left join public.environment_comments root_comment
          on root_comment.id = child.parent_comment_id
         and root_comment.deleted_at is null
         and root_comment.status = 'active'::comment_status
        inner join public.users scope_user
          on scope_user.id = coalesce(root_comment.user_id, child.user_id)
         and scope_user.deleted_at is null
        inner join public.roles scope_role
          on scope_role.id = scope_user.role_id
         and scope_role.is_active = true
        where child.id = $${parentIdParam}
          and (child.parent_comment_id is null or root_comment.id is not null)
          and child.deleted_at is null
          and child.status = 'active'::comment_status
          and (${access.sql})
        limit 1
      ),
      inserted_comment as (
        insert into public.environment_comments (
          user_id,
          parent_comment_id,
          content,
          status
        )
        select
          $${userIdParam},
          case when $${parentIdParam}::bigint is null then null else parent_comment.id end,
          $${contentParam},
          'active'::comment_status
        from (select 1) seed
        left join parent_comment on true
        where $${parentIdParam}::bigint is null or parent_comment.id is not null
        returning *
      )
      select
        ec.id,
        ec.user_id,
        ec.parent_comment_id,
        ec.content,
        ec.created_at,
        u.first_name,
        u.last_name,
        (u.profile_photo_url is not null) as has_profile_photo,
        r.code as role_code
      from inserted_comment ec
      inner join public.users u
        on u.id = ec.user_id
       and u.deleted_at is null
      inner join public.roles r
        on r.id = u.role_id
       and r.is_active = true
    `,
    [...access.params, parentCommentId, user.id, content],
  );

  return result.rows[0] ? toEnvironmentComment(result.rows[0]) : null;
}

/**
 * Busca la foto del autor del comentario de entorno y devuelve null cuando no existe un registro accesible.
 * Consulta o modifica PostgreSQL mediante parámetros y devuelve una representación estable.
 *
 * @param {string} authorUserId - Valor de `authorUserId` requerido por esta operación.
 * @param {unknown} user - Usuario autenticado que ejecuta la operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 */
export async function findEnvironmentCommentAuthorProfilePhoto(
  authorUserId,
  user,
) {
  const access = getEnvironmentCommentAccess(user);
  const authorUserIdParam = access.params.length + 1;
  const result = await query(
    `
      select author.profile_photo_url
      from public.environment_comments ec
      inner join public.users author
        on author.id = ec.user_id
       and author.deleted_at is null
      left join public.environment_comments root_comment
        on root_comment.id = ec.parent_comment_id
       and root_comment.deleted_at is null
       and root_comment.status = 'active'::comment_status
      inner join public.users scope_user
        on scope_user.id = coalesce(root_comment.user_id, ec.user_id)
       and scope_user.deleted_at is null
      inner join public.roles scope_role
        on scope_role.id = scope_user.role_id
       and scope_role.is_active = true
      where ec.user_id = $${authorUserIdParam}
        and (ec.parent_comment_id is null or root_comment.id is not null)
        and ec.deleted_at is null
        and ec.status = 'active'::comment_status
        and (${access.sql})
      limit 1
    `,
    [...access.params, authorUserId],
  );

  return result.rows[0]?.profile_photo_url || null;
}
