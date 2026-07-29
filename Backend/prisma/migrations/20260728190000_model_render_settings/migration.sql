CREATE TABLE public.model_render_settings (
  id BIGSERIAL PRIMARY KEY,
  file_id BIGINT NOT NULL UNIQUE,
  project_id BIGINT NOT NULL,
  updated_by BIGINT NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  profile VARCHAR(20) NOT NULL DEFAULT 'exterior',
  exposure NUMERIC(4, 2) NOT NULL DEFAULT 0.82,
  shadow_intensity NUMERIC(4, 2) NOT NULL DEFAULT 1.50,
  environment VARCHAR(30) NOT NULL DEFAULT 'studio',
  material_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_model_render_settings_file FOREIGN KEY (file_id)
    REFERENCES public.files(id) ON DELETE CASCADE,
  CONSTRAINT fk_model_render_settings_project FOREIGN KEY (project_id)
    REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_model_render_settings_updated_by FOREIGN KEY (updated_by)
    REFERENCES public.users(id) ON DELETE NO ACTION,
  CONSTRAINT chk_model_render_settings_profile
    CHECK (profile IN ('exterior', 'interior', 'night')),
  CONSTRAINT chk_model_render_settings_exposure
    CHECK (exposure BETWEEN 0.50 AND 2.00),
  CONSTRAINT chk_model_render_settings_shadow
    CHECK (shadow_intensity BETWEEN 0.00 AND 3.00),
  CONSTRAINT chk_model_render_settings_schema_version
    CHECK (schema_version > 0),
  CONSTRAINT chk_model_render_settings_overrides_object
    CHECK (jsonb_typeof(material_overrides) = 'object')
);

CREATE INDEX idx_model_render_settings_project
  ON public.model_render_settings(project_id);

ALTER TABLE public.model_render_settings ENABLE ROW LEVEL SECURITY;
