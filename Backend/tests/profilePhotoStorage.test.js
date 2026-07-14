import assert from "node:assert/strict";
import test from "node:test";

process.env.SUPABASE_STORAGE_S3_ACCESS_KEY_ID ||= "test-access-key";
process.env.SUPABASE_STORAGE_S3_ENDPOINT ||= "https://storage.example.test";
process.env.SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY ||= "test-secret-key";
process.env.SUPABASE_STORAGE_BUCKET = "profile-images";
process.env.SUPABASE_URL = "https://current-project.supabase.co";

const { getStorageObjectKeyFromFileUrl } = await import(
  "../src/config/storage.js"
);

test("profile photo storage keys support current and historical Supabase hosts", () => {
  const key = "users/42/profile-photo/2026/07/avatar.jpg";

  assert.equal(
    getStorageObjectKeyFromFileUrl(
      `https://current-project.supabase.co/storage/v1/object/public/profile-images/${key}`,
    ),
    key,
  );
  assert.equal(
    getStorageObjectKeyFromFileUrl(
      `https://historical-host.example/storage/v1/object/public/profile-images/${key}`,
    ),
    key,
  );
  assert.equal(
    getStorageObjectKeyFromFileUrl(`s3://profile-images/${key}`),
    key,
  );
});

test("profile photo storage keys reject other buckets and unrelated URLs", () => {
  assert.equal(
    getStorageObjectKeyFromFileUrl(
      "https://historical-host.example/storage/v1/object/public/other-bucket/users/42/avatar.jpg",
    ),
    null,
  );
  assert.equal(
    getStorageObjectKeyFromFileUrl("https://example.com/avatar.jpg"),
    null,
  );
});
