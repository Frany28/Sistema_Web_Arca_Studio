import "dotenv/config";

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import {
  buildStorageFileUrl,
  buildStorageObjectKey,
  getFileExtension,
  getSupabaseS3Client,
  getSupabaseStorageConfig,
  sanitizeStorageFileName,
} from "../src/config/storage.js";
import { pool } from "../src/config/db.js";

const MODEL_CONTENT_TYPE = "model/gltf-binary";

function getArguments() {
  const [, , sourcePath, projectName = "Quinta Bella Vista"] = process.argv;

  if (!sourcePath) {
    throw new Error(
      "Uso: node scripts/upload-project-model.mjs <ruta-glb> [nombre-proyecto]",
    );
  }

  return {
    projectName,
    sourcePath: path.resolve(sourcePath),
  };
}

async function uploadProjectModel({ projectName, sourcePath }) {
  const sourceStats = await stat(sourcePath);

  if (!sourceStats.isFile() || sourceStats.size <= 0) {
    throw new Error("La ruta indicada no contiene un archivo valido.");
  }

  if (path.extname(sourcePath).toLowerCase() !== ".glb") {
    throw new Error("El archivo debe tener extension .glb.");
  }

  const storageConfig = getSupabaseStorageConfig();

  if (!storageConfig.bucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET is required");
  }

  const client = await pool.connect();
  const s3Client = getSupabaseS3Client();
  const originalName = path.basename(sourcePath);
  const uploadedAt = new Date();
  const versionNumber = 1;
  let uploadedStorageKey = null;

  try {
    await client.query("begin");

    const projectResult = await client.query(
      `
        select id, name, created_by
        from public.projects
        where deleted_at is null
          and lower(name) = lower($1)
        limit 2
      `,
      [projectName],
    );

    if (projectResult.rowCount !== 1) {
      throw new Error(
        projectResult.rowCount === 0
          ? `No se encontro el proyecto "${projectName}".`
          : `Hay mas de un proyecto llamado "${projectName}".`,
      );
    }

    const project = projectResult.rows[0];
    const existingResult = await client.query(
      `
        select id
        from public.files
        where project_id = $1
          and deleted_at is null
          and status <> 'deleted'
          and lower(title) = lower($2)
        limit 1
      `,
      [project.id, originalName],
    );

    if (existingResult.rowCount > 0) {
      throw new Error(
        `El proyecto ya tiene un archivo activo llamado "${originalName}".`,
      );
    }

    const fileResult = await client.query(
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
        values ($1, $2, $3, $4, $5, $6, 'active'::file_status)
        returning id
      `,
      [
        project.id,
        project.created_by,
        originalName,
        "Modelo 3D de la construccion en formato GLB.",
        MODEL_CONTENT_TYPE,
        versionNumber,
      ],
    );
    const fileId = fileResult.rows[0].id;
    const storageKey = buildStorageObjectKey({
      belongsTo: "projects",
      fileId,
      originalName,
      ownerId: project.created_by,
      parentId: project.id,
      uploadedAt,
      versionNumber,
    });
    const fileUrl = buildStorageFileUrl(storageKey);
    uploadedStorageKey = storageKey;

    await s3Client.send(
      new PutObjectCommand({
        Body: createReadStream(sourcePath),
        Bucket: storageConfig.bucket,
        ContentLength: sourceStats.size,
        ContentType: MODEL_CONTENT_TYPE,
        Key: storageKey,
        Metadata: {
          belongs_to: "project",
          file_id: String(fileId),
          project_id: String(project.id),
          uploaded_by: String(project.created_by),
          uploaded_year: String(uploadedAt.getUTCFullYear()),
        },
      }),
    );

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
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
        returning id
      `,
      [
        fileId,
        project.created_by,
        versionNumber,
        storageKey,
        sanitizeStorageFileName(originalName),
        fileUrl,
        getFileExtension(originalName),
        sourceStats.size,
        "Carga inicial del modelo 3D.",
      ],
    );

    await client.query("commit");

    const storedObject = await s3Client.send(
      new HeadObjectCommand({
        Bucket: storageConfig.bucket,
        Key: storageKey,
      }),
    );

    return {
      contentLength: storedObject.ContentLength,
      contentType: storedObject.ContentType,
      fileId: Number(fileId),
      fileUrl,
      originalName,
      projectId: Number(project.id),
      projectName: project.name,
      storageKey,
      versionId: Number(versionResult.rows[0].id),
    };
  } catch (error) {
    await client.query("rollback").catch(() => {});

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

try {
  const result = await uploadProjectModel(getArguments());
  console.log(JSON.stringify(result, null, 2));
} finally {
  await pool.end();
}
