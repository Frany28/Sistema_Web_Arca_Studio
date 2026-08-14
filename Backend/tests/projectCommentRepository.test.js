import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryUrl = new URL(
  "../src/repositories/projectCommentRepository.js",
  import.meta.url,
);

test("general project comments resolve document extensions from file versions", async () => {
  const source = await readFile(repositoryUrl, "utf8");

  assert.match(source, /left join public\.file_versions fv/);
  assert.match(source, /fv\.file_extension/);
  assert.doesNotMatch(source, /f\.extension\s+as\s+file_extension/);
});
