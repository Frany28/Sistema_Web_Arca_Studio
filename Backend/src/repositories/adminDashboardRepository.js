import { query } from "../config/db.js";
import { mapAdminDashboardMetrics } from "../utils/adminDashboardMetrics.js";

export async function getAdminDashboardMetrics() {
  const result = await query(`
    with time_bounds as (
      select
        date_trunc('month', current_timestamp) as month_start,
        date_trunc('day', current_timestamp) as today_start
    )
    select
      (select count(*) from public.users
        where status = 'active' and deleted_at is null) as active_users_total,
      (select count(*) from public.users, time_bounds
        where status = 'active' and deleted_at is null
          and created_at >= time_bounds.month_start) as active_users_this_month,
      (select count(*) from public.projects
        where status in ('pending', 'in_process') and deleted_at is null) as active_projects_total,
      (select count(*) from public.projects, time_bounds
        where status in ('pending', 'in_process') and deleted_at is null
          and created_at >= time_bounds.month_start) as active_projects_this_month,
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
      (select count(*) from public.project_requests, time_bounds
        where status in ('pending_verification', 'pending_review')
          and deleted_at is null
          and created_at >= time_bounds.today_start) as requests_today,
      (select count(*) from public.model_processing_jobs
        where status = 'failed') as critical_events_total,
      (select max(updated_at) from public.model_processing_jobs
        where status = 'failed') as latest_critical_event_at
  `);

  return mapAdminDashboardMetrics(result.rows[0]);
}
