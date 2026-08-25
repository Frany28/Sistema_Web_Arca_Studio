UPDATE public.projects AS project
SET
  archived_from_status = project.status,
  status = 'archived'::public.project_status,
  deleted_at = NULL,
  is_public = FALSE,
  updated_at = CURRENT_TIMESTAMP
WHERE project.deleted_at IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.audit_logs AS audit
    WHERE audit.entity_type = 'project'
      AND audit.entity_id = project.id
      AND audit.action = 'project.archive'
      AND audit.created_at = project.deleted_at
      AND audit.new_values->>'archivedAt' = to_char(
        project.deleted_at AT TIME ZONE 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
      )
  );
