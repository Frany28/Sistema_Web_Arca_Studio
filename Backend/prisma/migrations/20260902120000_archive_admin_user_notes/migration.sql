ALTER TABLE public.admin_user_notes
  ADD COLUMN archived_at TIMESTAMPTZ(6);

CREATE INDEX admin_user_notes_active_owner_target_cursor_idx
  ON public.admin_user_notes (admin_user_id, target_user_id, created_at DESC, id DESC)
  WHERE archived_at IS NULL;
