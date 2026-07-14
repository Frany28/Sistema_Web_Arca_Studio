-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."anchor_type" AS ENUM ('image', 'video', 'viewer3d');

-- CreateEnum
CREATE TYPE "public"."client_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."comment_status" AS ENUM ('active', 'resolved', 'deleted');

-- CreateEnum
CREATE TYPE "public"."comment_type" AS ENUM ('general', 'image', 'video', 'viewer3d');

-- CreateEnum
CREATE TYPE "public"."file_status" AS ENUM ('active', 'archived', 'deleted');

-- CreateEnum
CREATE TYPE "public"."project_request_status" AS ENUM ('pending_verification', 'pending_review', 'approved', 'rejected', 'converted');

-- CreateEnum
CREATE TYPE "public"."project_status" AS ENUM ('pending', 'in_process', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."project_type" AS ENUM ('residential', 'commercial', 'corporate', 'stands_exhibitions');

-- CreateEnum
CREATE TYPE "public"."user_status" AS ENUM ('active', 'inactive', 'blocked');

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "description" VARCHAR(255),
    "new_values" JSONB,
    "old_values" JSONB,
    "ip_address" VARCHAR(255),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "company_name" VARCHAR(150),
    "document_number" VARCHAR(150),
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "status" "public"."client_status" NOT NULL DEFAULT 'active',
    "notes" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comment_anchors" (
    "id" BIGSERIAL NOT NULL,
    "comment_id" BIGINT NOT NULL,
    "anchor_type" "public"."anchor_type" NOT NULL,
    "pos_x" DECIMAL(10,4),
    "pos_y" DECIMAL(10,4),
    "pos_z" DECIMAL(10,4),
    "video_second" DECIMAL(10,2),
    "camera_state_json" JSONB,
    "object_ref" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_versions" (
    "id" BIGSERIAL NOT NULL,
    "file_id" BIGINT NOT NULL,
    "uploaded_by" BIGINT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_extension" VARCHAR(50) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "change_note" VARCHAR(255),
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "file_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."files" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT,
    "project_request_id" BIGINT,
    "uploaded_by" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "file_type" VARCHAR(50) NOT NULL,
    "current_version" INTEGER,
    "status" "public"."file_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "project_id" BIGINT,
    "created_by" BIGINT,
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" BIGINT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_recovery_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "requested_ip" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_recovery_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(255),
    "module" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_comments" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "file_id" BIGINT,
    "file_version_id" BIGINT,
    "parent_comment_id" BIGINT,
    "comment_type" "public"."comment_type" NOT NULL DEFAULT 'general',
    "content" TEXT NOT NULL,
    "status" "public"."comment_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "target_id" TEXT,
    "target_metadata" JSONB,

    CONSTRAINT "project_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_milestones" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "stage_id" BIGINT,
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(255),
    "due_date" DATE NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "status" "public"."project_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_progress_updates" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "updated_by" BIGINT NOT NULL,
    "progress" BIGINT,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_progress_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_requests" (
    "id" BIGSERIAL NOT NULL,
    "client_id" BIGINT NOT NULL,
    "requested_by" BIGINT NOT NULL,
    "project_name" VARCHAR(150) NOT NULL,
    "project_type" "public"."project_type" NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "has_plans" BOOLEAN NOT NULL DEFAULT false,
    "general_area" DECIMAL(10,2),
    "construction_area" DECIMAL(10,2),
    "zoning" TEXT,
    "procedures" TEXT,
    "conditions" TEXT,
    "equipment_used" TEXT,
    "reference_link" VARCHAR(500),
    "status" "public"."project_request_status" NOT NULL DEFAULT 'pending_verification',
    "verification_code_hash" VARCHAR(255) NOT NULL,
    "verification_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "reviewed_by" BIGINT,
    "reviewed_at" TIMESTAMPTZ(6),
    "rejection_reason" VARCHAR(255),
    "converted_project_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "location_latitude" DECIMAL(10,7),
    "location_longitude" DECIMAL(10,7),
    "provider_place_id" VARCHAR,
    "formatted_address" VARCHAR,

    CONSTRAINT "project_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_requirements" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "project_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_stages" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(255),
    "status" "public"."project_status" NOT NULL DEFAULT 'pending',
    "sort_order" BIGINT NOT NULL DEFAULT 0,
    "start_date" DATE,
    "end_date" DATE,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "project_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_status_history" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "changed_by" BIGINT NOT NULL,
    "previous_status" VARCHAR(50) NOT NULL,
    "new_status" VARCHAR(50) NOT NULL,
    "note" VARCHAR(255),
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_technical_specification_items" (
    "id" BIGSERIAL NOT NULL,
    "specification_id" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "project_technical_specification_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_technical_specifications" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "default_open" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "project_technical_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" BIGSERIAL NOT NULL,
    "client_id" BIGINT NOT NULL,
    "created_by" BIGINT NOT NULL,
    "assigned_architect_id" BIGINT,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "public"."project_status" NOT NULL DEFAULT 'pending',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "budget" DECIMAL(10,2),
    "progress" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "project_type" "public"."project_type" NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "has_plans" BOOLEAN NOT NULL DEFAULT false,
    "general_area" DECIMAL(10,2),
    "construction_area" DECIMAL(10,2),
    "area_unit" VARCHAR(20) NOT NULL DEFAULT 'mts',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "location_latitude" DECIMAL(10,7),
    "location_longitude" DECIMAL(10,7),
    "provider_place_id" VARCHAR,
    "formatted_address" VARCHAR,
    "public_slug" VARCHAR(160) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "id" BIGSERIAL NOT NULL,
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "client_id" BIGINT,
    "role_id" BIGINT NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "first_name" VARCHAR(150) NOT NULL,
    "last_name" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "profile_photo_url" VARCHAR(255),
    "signature_url" VARCHAR(255),
    "phone" VARCHAR(30) NOT NULL,
    "status" "public"."user_status" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_clients_deleted_at" ON "public"."clients"("deleted_at" ASC);

-- CreateIndex
CREATE INDEX "idx_clients_document_number" ON "public"."clients"("document_number" ASC);

-- CreateIndex
CREATE INDEX "idx_clients_email" ON "public"."clients"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_clients_status" ON "public"."clients"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_file_versions_file_id" ON "public"."file_versions"("file_id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "uq_file_versions_current" ON "public"."file_versions"("file_id" ASC) WHERE ((is_current = true) AND (deleted_at IS NULL));

-- CreateIndex
CREATE UNIQUE INDEX "uq_file_versions_file_version" ON "public"."file_versions"("file_id" ASC, "version_number" ASC);

-- CreateIndex
CREATE INDEX "files_project_active_cursor_idx" ON "public"."files"("project_id" ASC, "created_at" DESC, "id" DESC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_files_project_id" ON "public"."files"("project_id" ASC) WHERE ((project_id IS NOT NULL) AND (deleted_at IS NULL));

-- CreateIndex
CREATE INDEX "idx_files_project_request_id" ON "public"."files"("project_request_id" ASC) WHERE ((project_request_id IS NOT NULL) AND (deleted_at IS NULL));

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "public"."notifications"("user_id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_permissions_code" ON "public"."permissions"("code" ASC);

-- CreateIndex
CREATE INDEX "idx_permissions_is_active" ON "public"."permissions"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_permissions_module" ON "public"."permissions"("module" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "public"."permissions"("code" ASC);

-- CreateIndex
CREATE INDEX "idx_project_comments_project_id" ON "public"."project_comments"("project_id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_project_comments_project_type_target" ON "public"."project_comments"("project_id" ASC, "comment_type" ASC, "target_id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "project_comments_active_cursor_idx" ON "public"."project_comments"("project_id" ASC, "created_at" ASC, "id" ASC) WHERE ((deleted_at IS NULL) AND (file_id IS NULL) AND (file_version_id IS NULL));

-- CreateIndex
CREATE INDEX "idx_project_requirements_project" ON "public"."project_requirements"("project_id" ASC, "sort_order" ASC, "id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_project_technical_specification_items_spec" ON "public"."project_technical_specification_items"("specification_id" ASC, "sort_order" ASC, "id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_project_technical_specifications_project" ON "public"."project_technical_specifications"("project_id" ASC, "sort_order" ASC, "id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_projects_assigned_architect_id" ON "public"."projects"("assigned_architect_id" ASC);

-- CreateIndex
CREATE INDEX "idx_projects_client_id" ON "public"."projects"("client_id" ASC);

-- CreateIndex
CREATE INDEX "idx_projects_created_by" ON "public"."projects"("created_by" ASC);

-- CreateIndex
CREATE INDEX "idx_projects_deleted_at" ON "public"."projects"("deleted_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_projects_public_slug_active" ON "public"."projects"("public_slug" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_projects_start_date" ON "public"."projects"("start_date" ASC);

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "public"."projects"("status" ASC);

-- CreateIndex
CREATE INDEX "projects_active_updated_cursor_idx" ON "public"."projects"("updated_at" DESC, "id" DESC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_role_permissions_is_active" ON "public"."role_permissions"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_role_permissions_permission_id" ON "public"."role_permissions"("permission_id" ASC);

-- CreateIndex
CREATE INDEX "idx_role_permissions_role_id" ON "public"."role_permissions"("role_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "uk_role_permissions_role_permission" ON "public"."role_permissions"("role_id" ASC, "permission_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "public"."roles"("code" ASC);

-- CreateIndex
CREATE INDEX "idx_users_client_id" ON "public"."users"("client_id" ASC);

-- CreateIndex
CREATE INDEX "idx_users_deleted_at" ON "public"."users"("deleted_at" ASC);

-- CreateIndex
CREATE INDEX "idx_users_email" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_users_role_id" ON "public"."users"("role_id" ASC);

-- CreateIndex
CREATE INDEX "idx_users_status" ON "public"."users"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "fk_audit_logs_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."comment_anchors" ADD CONSTRAINT "fk_comment_anchors_comment" FOREIGN KEY ("comment_id") REFERENCES "public"."project_comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."file_versions" ADD CONSTRAINT "fk_file_versions_file" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."file_versions" ADD CONSTRAINT "fk_file_versions_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "fk_files_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "fk_files_project_request" FOREIGN KEY ("project_request_id") REFERENCES "public"."project_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "fk_files_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "fk_notifications_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "fk_notifications_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "fk_notifications_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."password_recovery_tokens" ADD CONSTRAINT "fk_password_recovery_tokens_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_comments" ADD CONSTRAINT "fk_project_comments_file" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_comments" ADD CONSTRAINT "fk_project_comments_file_version" FOREIGN KEY ("file_version_id") REFERENCES "public"."file_versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_comments" ADD CONSTRAINT "fk_project_comments_parent" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."project_comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_comments" ADD CONSTRAINT "fk_project_comments_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_comments" ADD CONSTRAINT "fk_project_comments_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_milestones" ADD CONSTRAINT "fk_project_milestones_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_milestones" ADD CONSTRAINT "fk_project_milestones_stage" FOREIGN KEY ("stage_id") REFERENCES "public"."project_stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_progress_updates" ADD CONSTRAINT "fk_project_progress_updates_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_progress_updates" ADD CONSTRAINT "fk_project_progress_updates_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_requests" ADD CONSTRAINT "fk_project_requests_client" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_requests" ADD CONSTRAINT "fk_project_requests_converted_project" FOREIGN KEY ("converted_project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_requests" ADD CONSTRAINT "fk_project_requests_requested_by" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_requests" ADD CONSTRAINT "fk_project_requests_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_requirements" ADD CONSTRAINT "fk_project_requirements_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."project_stages" ADD CONSTRAINT "fk_project_stages_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_status_history" ADD CONSTRAINT "fk_project_status_history_changed_by" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_status_history" ADD CONSTRAINT "fk_project_status_history_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE;

-- AddForeignKey
ALTER TABLE "public"."project_technical_specification_items" ADD CONSTRAINT "fk_project_technical_specification_items_specification" FOREIGN KEY ("specification_id") REFERENCES "public"."project_technical_specifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."project_technical_specifications" ADD CONSTRAINT "fk_project_technical_specifications_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_assigned_architect" FOREIGN KEY ("assigned_architect_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_client" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "fk_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "fk_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "fk_users_client" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PostgreSQL features not represented by Prisma Schema introspection.
ALTER TABLE public.file_versions ADD CONSTRAINT chk_file_versions_file_size CHECK (file_size > 0);
ALTER TABLE public.file_versions ADD CONSTRAINT chk_file_versions_version_number CHECK (version_number > 0);
ALTER TABLE public.files ADD CONSTRAINT chk_files_owner CHECK (((project_id IS NOT NULL) AND (project_request_id IS NULL)) OR ((project_id IS NULL) AND (project_request_id IS NOT NULL)));
ALTER TABLE public.project_requests ADD CONSTRAINT chk_project_requests_construction_area CHECK (construction_area IS NULL OR construction_area >= 0);
ALTER TABLE public.project_requests ADD CONSTRAINT chk_project_requests_general_area CHECK (general_area IS NULL OR general_area >= 0);
ALTER TABLE public.project_requirements ADD CONSTRAINT chk_project_requirements_description CHECK (length(trim(description)) > 0);
ALTER TABLE public.project_requirements ADD CONSTRAINT chk_project_requirements_sort_order CHECK (sort_order >= 0);
ALTER TABLE public.project_technical_specification_items ADD CONSTRAINT chk_project_technical_specification_items_content CHECK (length(trim(content)) > 0);
ALTER TABLE public.project_technical_specification_items ADD CONSTRAINT chk_project_technical_specification_items_sort_order CHECK (sort_order >= 0);
ALTER TABLE public.project_technical_specifications ADD CONSTRAINT chk_project_technical_specifications_sort_order CHECK (sort_order >= 0);
ALTER TABLE public.project_technical_specifications ADD CONSTRAINT chk_project_technical_specifications_title CHECK (length(trim(title)) > 0);
ALTER TABLE public.projects ADD CONSTRAINT chk_projects_budget CHECK (budget IS NULL OR budget >= 0);
ALTER TABLE public.projects ADD CONSTRAINT chk_projects_construction_area CHECK (construction_area IS NULL OR construction_area >= 0);
ALTER TABLE public.projects ADD CONSTRAINT chk_projects_dates CHECK (end_date IS NULL OR end_date >= start_date);
ALTER TABLE public.projects ADD CONSTRAINT chk_projects_general_area CHECK (general_area IS NULL OR general_area >= 0);
ALTER TABLE public.projects ADD CONSTRAINT chk_projects_progress CHECK (progress >= 0 AND progress <= 100);

CREATE UNIQUE INDEX uq_files_project_request_user_title ON public.files (project_request_id, uploaded_by, lower(title)) WHERE project_request_id IS NOT NULL AND deleted_at IS NULL AND status <> 'deleted'::file_status;
CREATE UNIQUE INDEX uq_project_requests_client_active_name ON public.project_requests (client_id, lower(project_name)) WHERE deleted_at IS NULL AND status IN ('pending_verification', 'pending_review', 'approved');
CREATE UNIQUE INDEX uq_projects_client_active_name ON public.projects (client_id, lower(name)) WHERE deleted_at IS NULL AND status <> 'cancelled'::project_status;
CREATE UNIQUE INDEX project_comments_viewer_point_unique_idx ON public.project_comments (project_id, comment_type, coalesce(target_id, ''), ((target_metadata->>'pointNumber')::integer)) WHERE deleted_at IS NULL AND parent_comment_id IS NULL AND comment_type = 'viewer3d'::comment_type AND target_metadata ? 'pointNumber';

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_recovery_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technical_specification_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technical_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
