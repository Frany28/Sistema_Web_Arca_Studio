ALTER TYPE public.project_compatibility_level
  ADD VALUE IF NOT EXISTS 'poorly_defined' AFTER 'low';
