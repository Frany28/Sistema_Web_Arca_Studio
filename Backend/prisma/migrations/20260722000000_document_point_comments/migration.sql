ALTER TYPE public.comment_type ADD VALUE IF NOT EXISTS 'document';
ALTER TYPE public.anchor_type ADD VALUE IF NOT EXISTS 'document';

ALTER TABLE public.comment_anchors
  ADD COLUMN IF NOT EXISTS page_number integer;

ALTER TABLE public.comment_anchors
  ADD CONSTRAINT chk_comment_anchors_document_point
  CHECK (
    anchor_type <> 'document'::anchor_type OR (
      page_number > 0 AND
      pos_x >= 0 AND pos_x <= 1 AND
      pos_y >= 0 AND pos_y <= 1
    )
  );

CREATE INDEX project_comments_document_version_cursor_idx
  ON public.project_comments (project_id, file_id, file_version_id, created_at, id)
  WHERE deleted_at IS NULL AND comment_type = 'document'::comment_type;

CREATE UNIQUE INDEX project_comments_document_point_unique_idx
  ON public.project_comments (
    project_id,
    file_id,
    file_version_id,
    ((target_metadata->>'pointNumber')::integer)
  )
  WHERE deleted_at IS NULL
    AND parent_comment_id IS NULL
    AND comment_type = 'document'::comment_type
    AND target_metadata ? 'pointNumber';
