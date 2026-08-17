CREATE TABLE public.project_assignees (
  project_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  assigned_by BIGINT NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT project_assignees_pkey PRIMARY KEY (project_id, user_id),
  CONSTRAINT fk_project_assignees_project
    FOREIGN KEY (project_id) REFERENCES public.projects(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_project_assignees_user
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_project_assignees_assigned_by
    FOREIGN KEY (assigned_by) REFERENCES public.users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_project_assignees_user_id
  ON public.project_assignees(user_id, project_id);

CREATE TABLE public.project_request_assignees (
  project_request_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  assigned_by BIGINT NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT project_request_assignees_pkey
    PRIMARY KEY (project_request_id, user_id),
  CONSTRAINT fk_project_request_assignees_request
    FOREIGN KEY (project_request_id) REFERENCES public.project_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_project_request_assignees_user
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_project_request_assignees_assigned_by
    FOREIGN KEY (assigned_by) REFERENCES public.users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_project_request_assignees_user_id
  ON public.project_request_assignees(user_id, project_request_id);

INSERT INTO public.project_assignees (project_id, user_id, assigned_by)
SELECT project.id, project.assigned_architect_id, project.created_by
FROM public.projects project
WHERE project.assigned_architect_id IS NOT NULL
ON CONFLICT (project_id, user_id) DO NOTHING;

ALTER TABLE public.project_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_request_assignees ENABLE ROW LEVEL SECURITY;
