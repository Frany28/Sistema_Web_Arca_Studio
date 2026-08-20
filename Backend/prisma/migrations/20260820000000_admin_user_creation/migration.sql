ALTER TABLE public.users
  ALTER COLUMN phone DROP NOT NULL,
  ADD COLUMN secondary_phone VARCHAR(30),
  ADD COLUMN company_name VARCHAR(150);

ALTER TABLE public.clients
  ALTER COLUMN phone DROP NOT NULL;

CREATE UNIQUE INDEX users_secondary_phone_active_key
  ON public.users (secondary_phone)
  WHERE deleted_at IS NULL AND secondary_phone IS NOT NULL;
