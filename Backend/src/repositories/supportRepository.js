import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { objectStorage } from "../services/objectStorage.js";

import {
  buildStorageFileUrl,
  buildStorageObjectKey,
  getFileExtension,
  getSupabaseS3Client,
  getSupabaseStorageConfig,
} from "../config/storage.js";
import { pool, query } from "../config/db.js";

let supportTablesReady = false;

async function ensureSupportTables() {
  if (supportTablesReady) {
    return;
  }

  await query(`
    create table if not exists public.support_requests (
      id bigserial primary key,
      user_id bigint not null,
      issue_type text,
      subject text not null,
      description text not null,
      status text not null default 'open',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      deleted_at timestamptz
    )
  `);

  await query(`
    create table if not exists public.support_request_files (
      id bigserial primary key,
      support_request_id bigint not null references public.support_requests(id) on delete cascade,
      uploaded_by bigint not null,
      original_name text not null,
      file_type text not null,
      file_extension text,
      file_size bigint not null,
      storage_key text not null,
      file_url text not null,
      created_at timestamptz not null default now(),
      deleted_at timestamptz
    )
  `);

  supportTablesReady = true;
}

function getFileType(contentType, originalName) {
  if (contentType) {
    return String(contentType).split(";")[0].trim().toLowerCase();
  }

  return getFileExtension(originalName) || "application/octet-stream";
}

export async function createSupportRequestForUser({
  description,
  issueType,
  subject,
  user,
}) {
  await ensureSupportTables();

  const result = await query(
    `
      insert into public.support_requests (
        user_id,
        issue_type,
        subject,
        description
      )
      values ($1, $2, $3, $4)
      returning id, user_id, issue_type, subject, description, status, created_at
    `,
    [
      user.id,
      String(issueType || "").trim() || null,
      String(subject || "").trim(),
      String(description || "").trim(),
    ],
  );

  const row = result.rows[0];

  return {
    createdAt: row.created_at,
    description: row.description,
    id: Number(row.id),
    issueType: row.issue_type,
    status: row.status,
    subject: row.subject,
    userId: Number(row.user_id),
  };
}

export async function findSupportRequestForUpload(supportRequestId, user) {
  await ensureSupportTables();

  const result = await query(
    `
      select id, user_id, status
      from public.support_requests
      where id = $1
        and deleted_at is null
      limit 1
    `,
    [supportRequestId],
  );
  const supportRequest = result.rows[0];

  if (!supportRequest) {
    return null;
  }

  const isOwner = Number(supportRequest.user_id) === Number(user.id);
  const isAdmin = user.role?.code === "admin";

  return isOwner || isAdmin ? supportRequest : null;
}

export async function uploadSupportRequestFile({
  body,
  contentType,
  originalName,
  size,
  supportRequestId,
  user,
}) {
  await ensureSupportTables();

  const storageConfig = getSupabaseStorageConfig();

  if (!storageConfig.bucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET is required");
  }

  const s3Client = getSupabaseS3Client();
  const uploadedAt = new Date();
  const safeOriginalName = String(originalName || "archivo").trim();
  const fileType = getFileType(contentType, safeOriginalName);
  const fileExtension = getFileExtension(safeOriginalName);
  const client = await pool.connect();
  let uploadedStorageKey = null;

  try {
    await client.query("begin");

    const fileResult = await client.query(
      `
        insert into public.support_request_files (
          support_request_id,
          uploaded_by,
          original_name,
          file_type,
          file_extension,
          file_size,
          storage_key,
          file_url
        )
        values ($1, $2, $3, $4, $5, $6, '', '')
        returning id
      `,
      [
        supportRequestId,
        user.id,
        safeOriginalName,
        fileType,
        fileExtension,
        size,
      ],
    );
    const fileId = Number(fileResult.rows[0].id);
    const storageKey = buildStorageObjectKey({
      belongsTo: "support-requests",
      fileId,
      originalName: safeOriginalName,
      ownerId: user.id,
      parentId: supportRequestId,
      uploadedAt,
      versionNumber: 1,
    });
    const fileUrl = buildStorageFileUrl(storageKey);
    uploadedStorageKey = storageKey;

    await objectStorage.put({
        body,
        contentLength: size,
        contentType: fileType,
        key: storageKey,
        metadata: {
          belongs_to: "support_request",
          support_request_file_id: String(fileId),
          support_request_id: String(supportRequestId),
          uploaded_by: String(user.id),
          uploaded_year: String(uploadedAt.getUTCFullYear()),
        },
    });

    const updatedResult = await client.query(
      `
        update public.support_request_files
        set storage_key = $2,
            file_url = $3
        where id = $1
        returning
          id,
          support_request_id,
          uploaded_by,
          original_name,
          file_type,
          file_extension,
          file_size,
          storage_key,
          file_url,
          created_at
      `,
      [fileId, storageKey, fileUrl],
    );

    await client.query("commit");

    const row = updatedResult.rows[0];

    return {
      createdAt: row.created_at,
      fileExtension: row.file_extension,
      fileSize: Number(row.file_size),
      fileType: row.file_type,
      fileUrl: row.file_url,
      id: Number(row.id),
      originalName: row.original_name,
      storageKey: row.storage_key,
      supportRequestId: Number(row.support_request_id),
      uploadedBy: Number(row.uploaded_by),
    };
  } catch (error) {
    await client.query("rollback");

    if (uploadedStorageKey) {
      await s3Client
        .send(
          new DeleteObjectCommand({
            Bucket: storageConfig.bucket,
            Key: uploadedStorageKey,
          }),
        )
        .catch(() => {});
    }

    throw error;
  } finally {
    client.release();
  }
}
