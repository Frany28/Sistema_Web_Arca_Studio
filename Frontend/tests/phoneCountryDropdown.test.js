import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("phone country options reuse the attached four-row dropdown pattern", async () => {
  const source = await readFile(
    new URL("../src/components/ui/Input/Input.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /top-\[calc\(100%_-_1px\)\]/);
  assert.match(source, /max-h-\[168px\]/);
  assert.match(source, /overflow-y-auto/);
  assert.match(source, /\[scrollbar-width:thin\]/);
  assert.match(source, /border-t-0/);
  assert.match(source, /rounded-b-\[12px\]/);
  assert.match(source, /h-\[35px\] shrink-0/);
  assert.match(source, /aria-haspopup="listbox"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.doesNotMatch(source, /top-\[calc\(100%\+8px\)\]/);
});
