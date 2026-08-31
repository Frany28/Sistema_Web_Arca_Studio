CREATE TABLE public.admin_user_notes (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id BIGINT NOT NULL,
  target_user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_admin_user_notes_content
    CHECK (char_length(btrim(content)) BETWEEN 1 AND 1000),
  CONSTRAINT fk_admin_user_notes_admin
    FOREIGN KEY (admin_user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_admin_user_notes_target
    FOREIGN KEY (target_user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX admin_user_notes_owner_target_cursor_idx
  ON public.admin_user_notes (admin_user_id, target_user_id, created_at DESC, id DESC);

ALTER TABLE public.admin_user_notes ENABLE ROW LEVEL SECURITY;
