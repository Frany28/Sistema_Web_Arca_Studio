CREATE TABLE public.environment_comments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  parent_comment_id BIGINT,
  content TEXT NOT NULL,
  status public.comment_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ(6),
  CONSTRAINT chk_environment_comments_content
    CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000),
  CONSTRAINT fk_environment_comments_user
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE,
  CONSTRAINT fk_environment_comments_parent
    FOREIGN KEY (parent_comment_id) REFERENCES public.environment_comments(id)
    ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE
);

CREATE INDEX environment_comments_user_active_cursor_idx
  ON public.environment_comments (user_id, created_at, id)
  WHERE deleted_at IS NULL AND status = 'active'::public.comment_status;

ALTER TABLE public.environment_comments ENABLE ROW LEVEL SECURITY;
