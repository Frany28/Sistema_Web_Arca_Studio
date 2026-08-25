ALTER TABLE public.projects
  ADD COLUMN archived_from_status public.project_status;

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
      AND (audit.new_values->>'archivedAt')::timestamptz = project.deleted_at
  );
