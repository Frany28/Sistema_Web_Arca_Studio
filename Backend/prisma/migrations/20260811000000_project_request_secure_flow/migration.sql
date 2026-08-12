DROP INDEX IF EXISTS public.uq_project_requests_client_active_name;
ALTER TABLE public.project_requests ALTER COLUMN status DROP DEFAULT;
ALTER TYPE public.project_request_status RENAME TO project_request_status_old;
CREATE TYPE public.project_request_status AS ENUM (
  'draft', 'pending_verification', 'pending_review', 'approved', 'rejected', 'converted'
);
ALTER TABLE public.project_requests
  ALTER COLUMN status TYPE public.project_request_status
  USING status::text::public.project_request_status;
DROP TYPE public.project_request_status_old;

CREATE TYPE public.project_request_size AS ENUM (
  'small_lt_80', 'medium_80_200', 'large_200_500', 'very_large_gt_500', 'unknown'
);
CREATE TYPE public.project_development_mode AS ENUM ('phased', 'full', 'undecided');
CREATE TYPE public.project_land_status AS ENUM ('available', 'acquiring', 'unavailable');
CREATE TYPE public.project_investment_range AS ENUM (
  'undefined', 'under_10k', '10k_50k', '50k_150k', 'over_150k'
);
CREATE TYPE public.project_capital_availability AS ENUM (
  'available_now', 'within_3_months', 'seeking_financing', 'undefined'
);
CREATE TYPE public.project_start_time AS ENUM (
  'immediate', '1_3_months', '3_6_months', 'over_6_months'
);
CREATE TYPE public.project_decision_maker AS ENUM (
  'self', 'partner', 'extended_family', 'company_board'
);
CREATE TYPE public.project_quality_expectation AS ENUM (
  'functional_economic', 'standard', 'premium', 'luxury'
);
CREATE TYPE public.project_design_experience AS ENUM ('positive', 'negative', 'first_time');
CREATE TYPE public.project_compatibility_level AS ENUM ('excellent', 'high', 'medium', 'low');

ALTER TABLE public.project_requests
  ALTER COLUMN has_plans DROP NOT NULL,
  ALTER COLUMN has_plans DROP DEFAULT,
  ALTER COLUMN verification_code_hash DROP NOT NULL,
  ALTER COLUMN verification_expires_at DROP NOT NULL,
  ALTER COLUMN status SET DEFAULT 'draft'::public.project_request_status,
  ADD COLUMN project_size public.project_request_size,
  ADD COLUMN development_mode public.project_development_mode,
  ADD COLUMN land_status public.project_land_status,
  ADD COLUMN investment_range public.project_investment_range,
  ADD COLUMN capital_availability public.project_capital_availability,
  ADD COLUMN expected_start_time public.project_start_time,
  ADD COLUMN decision_maker public.project_decision_maker,
  ADD COLUMN quality_expectation public.project_quality_expectation,
  ADD COLUMN prior_design_experience public.project_design_experience,
  ADD COLUMN submission_id UUID,
  ADD COLUMN compatibility_score INTEGER,
  ADD COLUMN compatibility_level public.project_compatibility_level,
  ADD COLUMN compatibility_reason_codes JSONB,
  ADD COLUMN compatibility_scoring_version VARCHAR(20),
  ADD CONSTRAINT chk_project_requests_compatibility_score
    CHECK (compatibility_score IS NULL OR compatibility_score BETWEEN 0 AND 100),
  ADD CONSTRAINT chk_project_requests_compatibility_reasons
    CHECK (compatibility_reason_codes IS NULL OR jsonb_typeof(compatibility_reason_codes) = 'array');

CREATE UNIQUE INDEX uq_project_requests_client_active_name
  ON public.project_requests (client_id, lower(project_name))
  WHERE deleted_at IS NULL
    AND status IN ('pending_verification', 'pending_review', 'approved');

CREATE UNIQUE INDEX uq_project_requests_submission
  ON public.project_requests (client_id, requested_by, submission_id)
  WHERE submission_id IS NOT NULL AND deleted_at IS NULL;
