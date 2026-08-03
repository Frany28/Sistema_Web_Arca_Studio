-- Delete legacy 3D conversations before changing the enum value. Replies are
-- included because PostgreSQL does not cascade this self-reference.
DELETE FROM public.comment_anchors
WHERE comment_id IN (
  SELECT id FROM public.project_comments
  WHERE comment_type = 'viewer3d'::public.comment_type
     OR parent_comment_id IN (
       SELECT id FROM public.project_comments
       WHERE comment_type = 'viewer3d'::public.comment_type
     )
);

DELETE FROM public.project_comments
WHERE parent_comment_id IN (
  SELECT id FROM public.project_comments
  WHERE comment_type = 'viewer3d'::public.comment_type
);

DELETE FROM public.project_comments
WHERE comment_type = 'viewer3d'::public.comment_type;

DROP INDEX IF EXISTS public.project_comments_viewer_point_unique_idx;
ALTER TYPE public.comment_type RENAME VALUE 'viewer3d' TO 'panorama';
ALTER TYPE public.anchor_type RENAME VALUE 'viewer3d' TO 'panorama';

CREATE TYPE public.file_category AS ENUM ('document', 'image', 'video', 'panorama');
ALTER TABLE public.files
  ADD COLUMN file_category public.file_category NOT NULL DEFAULT 'document';

UPDATE public.files
SET file_category = CASE
  WHEN file_type LIKE 'image/%' THEN 'image'::public.file_category
  WHEN file_type LIKE 'video/%' THEN 'video'::public.file_category
  ELSE 'document'::public.file_category
END;

CREATE INDEX files_project_category_active_idx
  ON public.files(project_id, file_category, created_at DESC, id DESC)
  WHERE deleted_at IS NULL AND status <> 'deleted'::public.file_status;

CREATE UNIQUE INDEX project_comments_panorama_point_unique_idx
  ON public.project_comments (
    project_id,
    comment_type,
    coalesce(target_id, ''),
    ((target_metadata->>'pointNumber')::integer)
  )
  WHERE deleted_at IS NULL
    AND parent_comment_id IS NULL
    AND comment_type = 'panorama'::public.comment_type
    AND target_metadata ? 'pointNumber';

-- Database records for models are removed here. Object storage cleanup is
-- intentionally performed by scripts/cleanup-legacy-models.mjs.
DELETE FROM public.file_versions
WHERE file_id IN (
  SELECT id FROM public.files
  WHERE file_type LIKE 'model/%'
     OR lower(coalesce(title, '')) ~ '\.(glb|glbf|gltf)$'
);

DELETE FROM public.files
WHERE file_type LIKE 'model/%'
   OR lower(coalesce(title, '')) ~ '\.(glb|glbf|gltf)$';

DROP TABLE IF EXISTS public.model_render_settings;
DROP TABLE IF EXISTS public.model_processing_jobs;
