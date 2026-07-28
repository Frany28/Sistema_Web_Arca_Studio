import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import {
  buildModelStagingObjectKey,
  buildStorageFileUrl,
  buildStorageObjectKey,
  sanitizeStorageFileName,
} from "../config/storage.js";
import { isTransientDatabaseError } from "../config/db.js";
import { ConflictError } from "../errors/appError.js";
import {
  claimNextModelProcessingJob,
  createModelProcessingJob,
  deleteReservedProcessedProjectFile,
  finalizeProcessedProjectFile,
  findModelProcessingJob,
  recordModelProcessingFailure,
  reserveProcessedProjectFile,
} from "../repositories/modelProcessingRepository.js";
import { findExistingProjectFile } from "../repositories/fileRepository.js";
import { objectStorage } from "./objectStorage.js";
import {
  ModelProcessingError,
  optimizeModelFile,
} from "./modelOptimizationService.js";
import { publishProjectEvent } from "./projectEvents.js";

const MODEL_CONTENT_TYPE = "model/gltf-binary";

function normalizeModelName(originalName) {
  const safeName = sanitizeStorageFileName(originalName);
  const baseName = safeName.replace(/\.(?:glb|glbf)$/iu, "");

  return `${baseName || "modelo-3d"}.glb`;
}

function isTransientProcessingError(error) {
  if (error instanceof ModelProcessingError) {
    return error.permanent === false;
  }

  if (isTransientDatabaseError(error)) {
    return true;
  }

  const code = String(error?.code || error?.name || "");
  return [
    "AbortError",
    "ECONNRESET",
    "ETIMEDOUT",
    "NetworkingError",
    "RequestTimeout",
    "ServiceUnavailable",
    "SlowDown",
  ].includes(code);
}

function getPublicErrorCode(error) {
  if (error instanceof ModelProcessingError) {
    return error.code;
  }

  if (error?.code === "23505" || error?.code === "DUPLICATE_PROJECT_FILE") {
    return "DUPLICATE_PROJECT_FILE";
  }

  return isTransientProcessingError(error)
    ? "MODEL_PROCESSING_TEMPORARILY_UNAVAILABLE"
    : "MODEL_PROCESSING_FAILED";
}

export async function stageProjectModel({
  body,
  contentType,
  originalName,
  projectId,
  size,
  user,
}) {
  const normalizedName = normalizeModelName(originalName);
  const existingFile = await findExistingProjectFile({
    originalName: normalizedName,
    projectId,
  });

  if (existingFile) {
    throw new ConflictError(
      "DUPLICATE_PROJECT_FILE",
      "Ese modelo ya existe en este proyecto.",
    );
  }

  const sourceStorageKey = buildModelStagingObjectKey({
    originalName,
    projectId,
    uploadedBy: user.id,
  });
  let staged = false;

  try {
    await objectStorage.put({
      body,
      contentLength: size,
      contentType: contentType || "application/octet-stream",
      key: sourceStorageKey,
      metadata: {
        belongs_to: "model_processing",
        project_id: String(projectId),
        uploaded_by: String(user.id),
      },
    });
    staged = true;

    return await createModelProcessingJob({
      contentType,
      inputSize: size,
      normalizedName,
      originalName,
      projectId,
      sourceStorageKey,
      uploadedBy: user.id,
    });
  } catch (error) {
    if (staged) {
      await objectStorage.delete(sourceStorageKey).catch(() => {});
    }

    throw error;
  }
}

export function getProjectModelProcessingJob({ jobId, projectId }) {
  return findModelProcessingJob({ jobId, projectId });
}

async function downloadStagedModel({ destinationPath, storageKey }) {
  const object = await objectStorage.get(storageKey);

  if (!object.Body) {
    throw new ModelProcessingError(
      "MODEL_SOURCE_UNAVAILABLE",
      "No se encontró el archivo temporal del modelo.",
      { permanent: false },
    );
  }

  await pipeline(object.Body, createWriteStream(destinationPath, { flags: "wx" }));
}

async function publishProcessedModel({ job, outputPath, outputSize }) {
  let fileId = null;
  let finalStorageKey = null;

  try {
    fileId = await reserveProcessedProjectFile({
      normalizedName: job.normalizedName,
      projectId: job.projectId,
      uploadedBy: job.uploadedBy,
    });
    finalStorageKey = buildStorageObjectKey({
      belongsTo: "projects",
      fileId,
      originalName: job.normalizedName,
      ownerId: job.uploadedBy,
      parentId: job.projectId,
      versionNumber: 1,
    });
    await objectStorage.put({
      body: createReadStream(outputPath),
      contentLength: outputSize,
      contentType: MODEL_CONTENT_TYPE,
      key: finalStorageKey,
      metadata: {
        belongs_to: "project",
        file_id: String(fileId),
        project_id: String(job.projectId),
        uploaded_by: String(job.uploadedBy),
      },
    });
    const result = await finalizeProcessedProjectFile({
      fileId,
      fileUrl: buildStorageFileUrl(finalStorageKey),
      jobId: job.id,
      normalizedName: job.normalizedName,
      outputSize,
      storageKey: finalStorageKey,
      uploadedBy: job.uploadedBy,
    });

    return {
      ...result,
      fileId,
    };
  } catch (error) {
    if (finalStorageKey) {
      await objectStorage.delete(finalStorageKey).catch(() => {});
    }

    if (fileId) {
      await deleteReservedProcessedProjectFile(fileId).catch(() => {});
    }

    throw error;
  }
}

export async function processNextModelJob() {
  const job = await claimNextModelProcessingJob({
    leaseSeconds: Number(process.env.MODEL_PROCESSING_LEASE_SECONDS || 240),
  });

  if (!job) {
    return { processed: false };
  }

  publishProjectEvent({
    eventName: "model.processing.started",
    payload: {
      jobId: job.id,
      projectId: job.projectId,
      status: "processing",
    },
    projectId: job.projectId,
  });

  const workDirectory = await mkdtemp(
    path.join(tmpdir(), `arca-model-${job.id}-`),
  );
  const inputPath = path.join(workDirectory, "source.glb");

  try {
    await downloadStagedModel({
      destinationPath: inputPath,
      storageKey: job.sourceStorageKey,
    });
    const optimized = await optimizeModelFile({
      inputPath,
      workDirectory,
    });
    const published = await publishProcessedModel({
      job,
      outputPath: optimized.outputPath,
      outputSize: optimized.outputSize,
    });
    await objectStorage.delete(job.sourceStorageKey).catch(() => {});

    publishProjectEvent({
      eventName: "model.processing.completed",
      payload: {
        fileId: published.fileId,
        jobId: job.id,
        outputSize: optimized.outputSize,
        projectId: job.projectId,
        status: "completed",
      },
      projectId: job.projectId,
    });

    return {
      fileId: published.fileId,
      job: published.job,
      processed: true,
    };
  } catch (error) {
    const errorCode = getPublicErrorCode(error);
    const failure = await recordModelProcessingFailure({
      attempts: job.attempts,
      errorCode,
      jobId: job.id,
      permanent: !isTransientProcessingError(error),
    });

    if (failure.terminal) {
      await objectStorage.delete(job.sourceStorageKey).catch(() => {});
      publishProjectEvent({
        eventName: "model.processing.failed",
        payload: {
          errorCode,
          jobId: job.id,
          projectId: job.projectId,
          status: "failed",
        },
        projectId: job.projectId,
      });
    }

    console.error("Model processing failed", {
      attempts: job.attempts,
      code: errorCode,
      jobId: job.id,
      terminal: failure.terminal,
    });

    return {
      errorCode,
      job: failure.job,
      processed: true,
      terminal: failure.terminal,
    };
  } finally {
    await rm(workDirectory, { force: true, recursive: true }).catch(() => {});
  }
}
