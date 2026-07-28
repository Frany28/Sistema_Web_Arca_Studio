import { pool, query } from "../config/db.js";

const MAX_ATTEMPTS = 3;

function toPublicJob(row) {
  return {
    completedAt: row.completed_at || null,
    createdAt: row.created_at,
    errorCode: row.error_code || null,
    fileId: row.file_id ? Number(row.file_id) : null,
    id: Number(row.id),
    inputSize: Number(row.input_size),
    originalName: row.original_name,
    outputSize: row.output_size ? Number(row.output_size) : null,
    status: row.status,
  };
}

function toInternalJob(row) {
  return {
    ...toPublicJob(row),
    attempts: Number(row.attempts),
    contentType: row.content_type,
    normalizedName: row.normalized_name,
    projectId: Number(row.project_id),
    sourceStorageKey: row.source_storage_key,
    uploadedBy: Number(row.uploaded_by),
  };
}

export async function createModelProcessingJob({
  contentType,
  inputSize,
  normalizedName,
  originalName,
  projectId,
  sourceStorageKey,
  uploadedBy,
}) {
  const result = await query(
    `
      insert into public.model_processing_jobs (
        project_id,
        uploaded_by,
        original_name,
        normalized_name,
        content_type,
        input_size,
        source_storage_key
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `,
    [
      projectId,
      uploadedBy,
      originalName,
      normalizedName,
      contentType,
      inputSize,
      sourceStorageKey,
    ],
  );

  return toPublicJob(result.rows[0]);
}

export async function findModelProcessingJob({ jobId, projectId }) {
  const result = await query(
    `
      select
        id,
        file_id,
        original_name,
        input_size,
        output_size,
        status,
        error_code,
        completed_at,
        created_at
      from public.model_processing_jobs
      where id = $1
        and project_id = $2
      limit 1
    `,
    [jobId, projectId],
  );

  return result.rows[0] ? toPublicJob(result.rows[0]) : null;
}

export async function claimNextModelProcessingJob({
  leaseSeconds = 240,
} = {}) {
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await client.query(
      `
        with candidate as (
          select id
          from public.model_processing_jobs
          where attempts < $1
            and (
              status = 'pending'
              or (status = 'processing' and lease_until < now())
            )
          order by created_at asc, id asc
          for update skip locked
          limit 1
        )
        update public.model_processing_jobs job
        set
          status = 'processing',
          attempts = job.attempts + 1,
          error_code = null,
          lease_until = now() + ($2 * interval '1 second'),
          started_at = coalesce(job.started_at, now()),
          updated_at = now()
        from candidate
        where job.id = candidate.id
        returning job.*
      `,
      [MAX_ATTEMPTS, leaseSeconds],
    );
    await client.query("commit");

    return result.rows[0] ? toInternalJob(result.rows[0]) : null;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function reserveProcessedProjectFile({
  normalizedName,
  projectId,
  uploadedBy,
}) {
  const result = await query(
    `
      insert into public.files (
        project_id,
        uploaded_by,
        title,
        description,
        file_type,
        current_version,
        status
      )
      values ($1, $2, $3, $4, 'model/gltf-binary', 1, 'archived'::file_status)
      returning id
    `,
    [
      projectId,
      uploadedBy,
      normalizedName,
      "Modelo 3D optimizado automáticamente para visualización web.",
    ],
  );

  return Number(result.rows[0].id);
}

export async function finalizeProcessedProjectFile({
  fileId,
  fileUrl,
  normalizedName,
  outputSize,
  storageKey,
  uploadedBy,
  jobId,
}) {
  const client = await pool.connect();

  try {
    await client.query("begin");
    const versionResult = await client.query(
      `
        insert into public.file_versions (
          file_id,
          uploaded_by,
          version_number,
          file_name,
          original_name,
          file_url,
          file_extension,
          file_size,
          change_note,
          is_current
        )
        values ($1, $2, 1, $3, $4, $5, 'glb', $6, $7, true)
        returning id
      `,
      [
        fileId,
        uploadedBy,
        storageKey,
        normalizedName,
        fileUrl,
        outputSize,
        "Optimización automática para visualización web.",
      ],
    );
    await client.query(
      `
        update public.files
        set status = 'active'::file_status, updated_at = now()
        where id = $1
      `,
      [fileId],
    );
    const jobResult = await client.query(
      `
        update public.model_processing_jobs
        set
          file_id = $2,
          output_size = $3,
          status = 'completed',
          error_code = null,
          lease_until = null,
          completed_at = now(),
          updated_at = now()
        where id = $1
        returning *
      `,
      [jobId, fileId, outputSize],
    );
    await client.query("commit");

    return {
      job: toPublicJob(jobResult.rows[0]),
      versionId: Number(versionResult.rows[0].id),
    };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteReservedProcessedProjectFile(fileId) {
  await query(
    `
      delete from public.files
      where id = $1
        and status = 'archived'::file_status
        and not exists (
          select 1 from public.file_versions version where version.file_id = files.id
        )
    `,
    [fileId],
  );
}

export async function recordModelProcessingFailure({
  attempts,
  errorCode,
  jobId,
  permanent,
}) {
  const terminal = permanent || attempts >= MAX_ATTEMPTS;
  const result = await query(
    `
      update public.model_processing_jobs
      set
        status = $2,
        error_code = $3,
        lease_until = null,
        completed_at = case when $2 = 'failed' then now() else null end,
        updated_at = now()
      where id = $1
      returning *
    `,
    [jobId, terminal ? "failed" : "pending", errorCode],
  );

  return {
    job: toPublicJob(result.rows[0]),
    terminal,
  };
}
