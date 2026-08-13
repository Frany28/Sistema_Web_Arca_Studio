ALTER TABLE public.comment_anchors
  ADD COLUMN IF NOT EXISTS anchor_context_json jsonb;

ALTER TABLE public.comment_anchors
  DROP CONSTRAINT IF EXISTS chk_comment_anchors_document_point;

ALTER TABLE public.comment_anchors
  ADD CONSTRAINT chk_comment_anchors_document_point
  CHECK (
    anchor_type <> 'document'::anchor_type OR (
      pos_x >= 0 AND pos_x <= 1 AND
      pos_y >= 0 AND pos_y <= 1 AND (
        (anchor_context_json IS NULL AND page_number > 0) OR
        (anchor_context_json->>'kind' = 'document-point' AND page_number > 0) OR
        (anchor_context_json->>'kind' = 'document-section-point'
          AND (anchor_context_json->>'sectionIndex')::integer >= 0) OR
        (anchor_context_json->>'kind' = 'document-cell-point'
          AND jsonb_typeof(anchor_context_json->'sheetName') = 'string'
          AND jsonb_typeof(anchor_context_json->'cell') = 'string')
      )
    )
  );
