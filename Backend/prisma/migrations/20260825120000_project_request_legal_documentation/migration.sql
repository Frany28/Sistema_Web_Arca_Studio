CREATE TYPE public.project_legal_documentation_status AS ENUM (
  'available',
  'in_process',
  'unavailable'
);

ALTER TABLE public.project_requests
  ADD COLUMN legal_documentation_status public.project_legal_documentation_status,
  ADD COLUMN legal_document_types text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN has_multiple_owners boolean;

ALTER TABLE public.project_requests
  ADD CONSTRAINT project_requests_legal_document_types_allowed_check
    CHECK (
      legal_document_types <@ ARRAY[
        'property_deed',
        'purchase_contract',
        'lease_contract',
        'other'
      ]::text[]
    ),
  ADD CONSTRAINT project_requests_legal_documentation_consistency_check
    CHECK (
      legal_documentation_status IS NULL
      OR (
        legal_documentation_status = 'available'::public.project_legal_documentation_status
        AND cardinality(legal_document_types) > 0
      )
      OR (
        legal_documentation_status <> 'available'::public.project_legal_documentation_status
        AND cardinality(legal_document_types) = 0
      )
    );
