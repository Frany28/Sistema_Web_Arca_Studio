import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("admin user actions do not focus Suspend when opened with a pointer", async () => {
  const source = await readFile(
    new URL(
      "../src/pages/admin-users/AdminUserActionsMenu.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /focusFirstItemOnOpenRef\.current = event\.detail === 0/,
  );
  assert.match(
    source,
    /if \(focusFirstItemOnOpenRef\.current\)[\s\S]*querySelector\("button"\)\?\.focus\(\)/,
  );
  assert.match(source, /onClick=\{toggleMenu\}/);
  assert.doesNotMatch(
    source,
    /document\.addEventListener\("keydown", closeOnEscape\);\s*window\.requestAnimationFrame/,
  );
});
