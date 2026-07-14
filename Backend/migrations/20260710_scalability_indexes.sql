-- Apply once to PostgreSQL staging before production. Statements are idempotent.
create index if not exists projects_active_updated_cursor_idx
  on public.projects (updated_at desc, id desc) where deleted_at is null;

create index if not exists project_comments_active_cursor_idx
  on public.project_comments (project_id, created_at, id)
  where deleted_at is null and file_id is null and file_version_id is null;

create index if not exists files_project_active_cursor_idx
  on public.files (project_id, created_at desc, id desc)
  where deleted_at is null;

create unique index if not exists project_comments_viewer_point_unique_idx
  on public.project_comments (
    project_id,
    comment_type,
    coalesce(target_id, ''),
    ((target_metadata->>'pointNumber')::integer)
  )
  where deleted_at is null
    and parent_comment_id is null
    and comment_type = 'viewer3d'::comment_type
    and target_metadata ? 'pointNumber';
