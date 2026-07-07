import { S3Client } from "@aws-sdk/client-s3";

let s3Client = null;

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function getSupabaseStorageConfig() {
  return {
    accessKeyId: getRequiredEnv("SUPABASE_STORAGE_S3_ACCESS_KEY_ID"),
    bucket: process.env.SUPABASE_STORAGE_BUCKET || null,
    endpoint: getRequiredEnv("SUPABASE_STORAGE_S3_ENDPOINT"),
    region: process.env.SUPABASE_STORAGE_S3_REGION || "us-east-1",
    secretAccessKey: getRequiredEnv("SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY"),
  };
}

export function getSupabaseS3Client() {
  if (s3Client) {
    return s3Client;
  }

  const config = getSupabaseStorageConfig();

  s3Client = new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    forcePathStyle: true,
    region: config.region,
  });

  return s3Client;
}

function slugifySegment(value, fallback) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || fallback;
}

export function sanitizeStorageFileName(fileName) {
  const normalized = String(fileName || "").trim();
  const lastDotIndex = normalized.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0 && lastDotIndex < normalized.length - 1;
  const baseName = hasExtension
    ? normalized.slice(0, lastDotIndex)
    : normalized;
  const extension = hasExtension ? normalized.slice(lastDotIndex + 1) : "";
  const safeBaseName = slugifySegment(baseName, "archivo");
  const safeExtension = slugifySegment(extension, "");

  return safeExtension ? `${safeBaseName}.${safeExtension}` : safeBaseName;
}

export function getFileExtension(fileName) {
  const safeName = sanitizeStorageFileName(fileName);
  const lastDotIndex = safeName.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === safeName.length - 1) {
    return "";
  }

  return safeName.slice(lastDotIndex + 1);
}

export function buildStorageObjectKey({
  belongsTo,
  ownerId,
  parentId,
  fileId,
  versionNumber,
  originalName,
  uploadedAt = new Date(),
}) {
  const date = uploadedAt instanceof Date ? uploadedAt : new Date(uploadedAt);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeStorageFileName(originalName);

  return [
    slugifySegment(belongsTo, "general"),
    String(parentId),
    "users",
    String(ownerId),
    year,
    month,
    "files",
    String(fileId),
    `v${Number(versionNumber) || 1}`,
    safeName,
  ].join("/");
}

export function buildUserProfilePhotoObjectKey({
  originalName,
  uploadedAt = new Date(),
  userId,
}) {
  const date = uploadedAt instanceof Date ? uploadedAt : new Date(uploadedAt);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const timestamp = String(date.getTime());
  const safeName = sanitizeStorageFileName(originalName);

  return [
    "users",
    String(userId),
    "profile-photo",
    year,
    month,
    `${timestamp}-${safeName}`,
  ].join("/");
}

export function buildStorageFileUrl(objectKey) {
  const { bucket } = getSupabaseStorageConfig();

  if (process.env.SUPABASE_URL && bucket) {
    const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, "");
    return `${baseUrl}/storage/v1/object/public/${bucket}/${objectKey}`;
  }

  return bucket ? `s3://${bucket}/${objectKey}` : objectKey;
}

export function getStorageObjectKeyFromFileUrl(fileUrl) {
  const { bucket } = getSupabaseStorageConfig();
  const normalizedFileUrl = String(fileUrl || "").trim();

  if (!normalizedFileUrl || !bucket) {
    return null;
  }

  const publicPrefix = process.env.SUPABASE_URL
    ? `${process.env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/`
    : null;

  if (publicPrefix && normalizedFileUrl.startsWith(publicPrefix)) {
    return normalizedFileUrl.slice(publicPrefix.length);
  }

  const s3Prefix = `s3://${bucket}/`;

  if (normalizedFileUrl.startsWith(s3Prefix)) {
    return normalizedFileUrl.slice(s3Prefix.length);
  }

  return null;
}
