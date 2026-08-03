import "dotenv/config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../src/config/db.js";
import { getSupabaseS3Client, getSupabaseStorageConfig } from "../src/config/storage.js";

const client = await pool.connect();
try {
  const tableResult = await client.query(
    `select to_regclass('public.model_processing_jobs') is not null as has_jobs,
            to_regclass('public.files') is not null as has_files`,
  );
  const storageKeys = new Set();
  if (tableResult.rows[0].has_files) {
    const files = await client.query(`
      select version.file_name as storage_key
      from public.file_versions version
      join public.files file on file.id = version.file_id
      where file.file_type like 'model/%' or lower(coalesce(file.title, '')) ~ '\\.(glb|glbf|gltf)$'
    `);
    files.rows.forEach((row) => row.storage_key && storageKeys.add(row.storage_key));
  }
  if (tableResult.rows[0].has_jobs) {
    const jobs = await client.query(`select source_storage_key as storage_key from public.model_processing_jobs`);
    jobs.rows.forEach((row) => row.storage_key && storageKeys.add(row.storage_key));
  }
  const config = getSupabaseStorageConfig();
  if (!config.bucket) throw new Error("SUPABASE_STORAGE_BUCKET is required");
  const storage = getSupabaseS3Client();
  for (const storageKey of storageKeys) {
    await storage.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: storageKey }));
  }
  console.log(`Objetos 3D eliminados: ${storageKeys.size}. Ya puede aplicarse la migración de panorámicas.`);
} finally {
  client.release();
  await pool.end();
}
