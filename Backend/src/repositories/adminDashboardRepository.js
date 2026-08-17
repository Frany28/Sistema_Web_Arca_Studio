import { query } from "../config/db.js";
import { mapAdminDashboardMetrics } from "../utils/adminDashboardMetrics.js";
import {
  mapAdminDashboardActivity,
  mapAdminDashboardRequest,
} from "../utils/adminDashboardOverview.js";

export async function getAdminDashboardMetrics() {
  const result = await query(`
    select
      (select count(*) from public.users
        where status = 'active' and deleted_at is null) as active_users_total,
      (select count(*) from public.users
        where status = 'active' and deleted_at is null
          and created_at >= date_trunc('month', current_timestamp)) as active_users_this_month,
      (select count(*) from public.projects
        where status in ('pending', 'in_process') and deleted_at is null) as active_projects_total,
      (select count(*) from public.projects
        where status in ('pending', 'in_process') and deleted_at is null
          and created_at >= date_trunc('month', current_timestamp)) as active_projects_this_month,
      (select count(*) from public.files
        where status <> 'deleted' and deleted_at is null) as files_total,
      (select coalesce(sum(file_version.file_size), 0)
        from public.files file
        inner join public.file_versions file_version
          on file_version.file_id = file.id
          and file_version.is_current = true
          and file_version.deleted_at is null
        where file.status <> 'deleted' and file.deleted_at is null) as files_total_bytes,
      (select count(*) from public.project_requests
        where status in ('pending_verification', 'pending_review')
          and deleted_at is null) as requests_total,
      (select count(*) from public.project_requests
        where status in ('pending_verification', 'pending_review')
          and deleted_at is null
          and created_at >= date_trunc('day', current_timestamp)) as requests_today,
      0::bigint as critical_events_total,
      null::timestamptz as latest_critical_event_at
  `);

  return mapAdminDashboardMetrics(result.rows[0]);
}

export async function getAdminDashboardOverview() {
  const [activityResult, requestsResult] = await Promise.all([
    query(`
      select
        activity_kind,
        activity_id,
        project_id,
        project_name,
        activity_title,
        user_name,
        created_at
      from (
        select
          'status'::text as activity_kind,
          history.id as activity_id,
          history.project_id,
          project.name as project_name,
          case
            when history.new_status = 'completed' then 'Entrega finalizada'
            else 'Estado actualizado'
          end as activity_title,
          concat_ws(' ', actor.first_name, actor.last_name) as user_name,
          history.changed_at as created_at
        from public.project_status_history history
        inner join public.projects project on project.id = history.project_id
        inner join public.users actor on actor.id = history.changed_by
        where project.deleted_at is null

        union all

        select
          'file'::text as activity_kind,
          file.id as activity_id,
          file.project_id,
          project.name as project_name,
          'Archivo agregado'::text as activity_title,
          concat_ws(' ', actor.first_name, actor.last_name) as user_name,
          file.created_at
        from public.files file
        inner join public.projects project on project.id = file.project_id
        inner join public.users actor on actor.id = file.uploaded_by
        where file.project_id is not null
          and file.deleted_at is null
          and file.status <> 'deleted'
          and project.deleted_at is null
      ) recent_activity
      order by created_at desc, activity_id desc
      limit 3
    `),
    query(`
      select id, project_name, project_type, status, created_at
      from public.project_requests
      where status in ('pending_verification', 'pending_review')
        and deleted_at is null
      order by created_at desc, id desc
      limit 4
    `),
  ]);

  return {
    newRequests: requestsResult.rows.map(mapAdminDashboardRequest),
    recentActivity: activityResult.rows.map(mapAdminDashboardActivity),
  };
}
