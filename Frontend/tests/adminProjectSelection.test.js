import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("selected admin project rows use the Figma neutral selection surface", async () => {
  const source = await readFile(
    new URL(
      "../src/pages/architect-dashboard/components/AdminActiveProjects.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /isSelected[\s\S]*bg-\[var\(--color-neutral-300\)\]/);
  assert.match(source, /data-selected=\{isSelected \? "true" : undefined\}/);
  assert.match(source, /checked=\{isSelected \? "Yes" : "No"\}/);
});
