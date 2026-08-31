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
  assert.match(source, /max-h-\[168px\] w-full min-w-0/);
  assert.match(source, /grid-cols-\[20px_44px_minmax\(0,1fr\)\]/);
  assert.match(source, /\{option\.abbreviation\}/);
  assert.match(source, /aria-haspopup="listbox"/);
  assert.match(source, /aria-label=\{`Seleccionar código de país\. Actual:/);
  assert.match(source, /onClick=\{\(\) => setIsPhoneMenuOpen\(\(current\) => !current\)\}/);
  assert.match(source, /\{normalizedPhonePrefix\}/);
  assert.doesNotMatch(source, /aria-label="Código de país"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.doesNotMatch(source, /top-\[calc\(100%\+8px\)\]/);
});

test("phone country options expose compact labels for the narrow selector", async () => {
  const source = await readFile(
    new URL("../src/components/ui/Input/phoneCountryOptions.js", import.meta.url),
    "utf8",
  );

  assert.match(source, /US: "USA"/);
  assert.match(source, /VE: "VE"/);
  assert.match(source, /NO: "NOR"/);
  assert.match(source, /\?\? normalizedCode/);
});
