ALTER TABLE public.clients
  ALTER COLUMN address DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN country DROP NOT NULL,
  ADD COLUMN referral_source VARCHAR(30);

CREATE TABLE public.user_registrations (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(150) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  company_name VARCHAR(150),
  referral_source VARCHAR(30) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_registrations_referral_source_check
    CHECK (referral_source IN ('instagram', 'referred', 'whatsapp', 'other'))
);

CREATE UNIQUE INDEX user_registrations_email_key
  ON public.user_registrations (lower(email));
CREATE UNIQUE INDEX user_registrations_phone_key
  ON public.user_registrations (phone);
CREATE INDEX idx_user_registrations_expires_at
  ON public.user_registrations (expires_at);
CREATE UNIQUE INDEX users_email_normalized_key
  ON public.users (lower(email)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX users_phone_active_key
  ON public.users (phone) WHERE deleted_at IS NULL;

ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;
