import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSupabaseS3Client, getSupabaseStorageConfig } from "../config/storage.js";

class S3ObjectStorage {
  config() {
    const config = getSupabaseStorageConfig();
    if (!config.bucket) throw new Error("SUPABASE_STORAGE_BUCKET is required");
    return config;
  }

  delete(key) {
    const { bucket } = this.config();
    return getSupabaseS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  get(key, { range } = {}) {
    const { bucket } = this.config();
    return getSupabaseS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: range || undefined }));
  }

  put({ body, contentLength, contentType, key, metadata }) {
    const { bucket } = this.config();
    return getSupabaseS3Client().send(new PutObjectCommand({
      Body: body, Bucket: bucket, ContentLength: contentLength, ContentType: contentType, Key: key, Metadata: metadata,
    }));
  }
}

export const objectStorage = new S3ObjectStorage();
