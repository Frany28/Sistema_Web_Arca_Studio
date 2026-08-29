import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("confirmation modal follows the Figma warning dimensions and elevation", async () => {
  const source = await readFile(
    new URL("../src/components/ui/Modal/Modal.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /max-w-\[400px\]/);
  assert.match(source, /shadow-\[var\(--shadow-e2\)\]/);
  assert.match(source, /"h-\[41px\] min-w-0 w-auto flex-1"/);
  assert.match(source, /<CloseIcon className="size-5" \/>/);
  assert.match(source, /gap-\[16px\] border-t/);
});
