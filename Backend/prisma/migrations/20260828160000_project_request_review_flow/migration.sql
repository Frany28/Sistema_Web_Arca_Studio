ALTER TYPE public.project_request_status
  ADD VALUE IF NOT EXISTS 'changes_requested' BEFORE 'approved';

ALTER TABLE public.project_requests
  ALTER COLUMN rejection_reason TYPE TEXT,
  ADD COLUMN IF NOT EXISTS correction_reason TEXT,
  ADD COLUMN IF NOT EXISTS internal_review_notes TEXT;

DO $$
BEGIN
  CREATE TYPE public.project_request_review_recommendation AS ENUM (
    'approve',
    'reject',
    'changes_requested'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.project_request_reviews (
  id BIGSERIAL PRIMARY KEY,
  project_request_id BIGINT NOT NULL,
  reviewer_id BIGINT NOT NULL,
  recommendation public.project_request_review_recommendation NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT fk_project_request_reviews_request
    FOREIGN KEY (project_request_id) REFERENCES public.project_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_project_request_reviews_reviewer
    FOREIGN KEY (reviewer_id) REFERENCES public.users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uq_project_request_reviews_reviewer
    UNIQUE (project_request_id, reviewer_id),
  CONSTRAINT chk_project_request_reviews_note
    CHECK (length(btrim(note)) BETWEEN 10 AND 2000)
);

CREATE INDEX IF NOT EXISTS idx_project_request_reviews_reviewer
  ON public.project_request_reviews(reviewer_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_requests_converted_project
  ON public.project_requests(converted_project_id)
  WHERE converted_project_id IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE public.project_request_reviews ENABLE ROW LEVEL SECURITY;
