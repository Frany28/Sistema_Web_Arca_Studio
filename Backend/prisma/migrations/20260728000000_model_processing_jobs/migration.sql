CREATE TABLE "public"."model_processing_jobs" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "uploaded_by" BIGINT NOT NULL,
    "file_id" BIGINT,
    "original_name" VARCHAR(255) NOT NULL,
    "normalized_name" VARCHAR(255) NOT NULL,
    "content_type" VARCHAR(100) NOT NULL,
    "input_size" BIGINT NOT NULL,
    "output_size" BIGINT,
    "source_storage_key" VARCHAR(500) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error_code" VARCHAR(100),
    "lease_until" TIMESTAMPTZ(6),
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_processing_jobs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "model_processing_jobs_file_id_key" UNIQUE ("file_id"),
    CONSTRAINT "chk_model_processing_jobs_status"
      CHECK ("status" IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT "chk_model_processing_jobs_input_size" CHECK ("input_size" > 0),
    CONSTRAINT "chk_model_processing_jobs_output_size"
      CHECK ("output_size" IS NULL OR "output_size" > 0),
    CONSTRAINT "chk_model_processing_jobs_attempts"
      CHECK ("attempts" >= 0 AND "attempts" <= 3)
);

CREATE INDEX "idx_model_processing_jobs_project"
  ON "public"."model_processing_jobs" ("project_id", "created_at" DESC, "id" DESC);

CREATE INDEX "idx_model_processing_jobs_queue"
  ON "public"."model_processing_jobs" ("status", "lease_until", "created_at", "id");

ALTER TABLE "public"."model_processing_jobs"
  ADD CONSTRAINT "fk_model_processing_jobs_project"
  FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."model_processing_jobs"
  ADD CONSTRAINT "fk_model_processing_jobs_uploaded_by"
  FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."model_processing_jobs"
  ADD CONSTRAINT "fk_model_processing_jobs_file"
  FOREIGN KEY ("file_id") REFERENCES "public"."files"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "public"."model_processing_jobs" ENABLE ROW LEVEL SECURITY;
