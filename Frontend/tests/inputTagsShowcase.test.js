import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("tag showcase data declares every Figma state in S, M and L", async () => {
  const source = await readFile(
    new URL("../src/components/ui/Input/inputShowcaseData.js", import.meta.url),
    "utf8",
  );

  assert.match(source, /inputTagShowcaseSizes = \["S", "M", "L"\]/);
  for (const state of ["Default", "Hover", "Focused", "Filled", "Disabled", "Error"]) {
    assert.match(source, new RegExp(`\\b${state}\\b`));
  }
  assert.match(source, /inputTagShowcaseSizes\.flatMap/);
  assert.match(source, /inputTagShowcaseStates\.map/);
  assert.match(source, /\["Focused", "Filled", "Error"\]\.includes\(state\)/);
  assert.match(source, /disabled: state === "Disabled"/);
});

test("tag input exposes accessible state, keyboard behavior and Figma hint rules", async () => {
  const inputSource = await readFile(
    new URL("../src/components/ui/Input/Input.jsx", import.meta.url),
    "utf8",
  );

  assert.match(inputSource, /tags = \[\]/);
  assert.match(
    inputSource,
    /showHint && !\(resolvedType === "Tags" && resolvedState === "Focused"\)/,
  );
  assert.match(inputSource, /aria-describedby=\{resolvedAriaDescribedBy\}/);
  assert.match(inputSource, /aria-invalid=\{resolvedAriaInvalid\}/);
  assert.match(inputSource, /onKeyDown=\{handleInputKeyDown\}/);
  assert.match(inputSource, /currentLabel === nextLabel/);
  assert.match(inputSource, /avatarSrc=\{tag\.avatarSrc \?\? ""\}/);
  assert.match(inputSource, /handleTagOptionSelection/);
  assert.match(inputSource, /closeIcon=\{false\}/);
  assert.match(inputSource, /baseState === "Default" && isFocused/);
  assert.match(inputSource, /showSelectedTagsBelow/);
  assert.match(inputSource, /maxVisibleTagOptions = 3/);
  assert.match(inputSource, /visibleSelectableTags = filteredSelectableTags\.slice/);
  assert.match(inputSource, /onMouseDown=\{\(event\) => event\.preventDefault\(\)\}/);
  assert.match(inputSource, /requestAnimationFrame\(\(\) => resolvedInputRef\.current\?\.focus\(\)\)/);
});

test("tag avatars support real images with fallback initials", async () => {
  const tagSource = await readFile(
    new URL("../src/components/ui/Tag/Tag.jsx", import.meta.url),
    "utf8",
  );

  assert.match(tagSource, /avatarSrc = ""/);
  assert.match(tagSource, /failedSrc !== src/);
  assert.match(tagSource, /className="size-full object-cover"/);
  assert.match(tagSource, /showImage \?/);
  assert.match(tagSource, /aria-label=\{`Quitar \$\{label\}`\}/);
  assert.match(tagSource, /text-\[var\(--color-text-200\)\]/);
});

test("public staging route renders the interactive example and the 18-state matrix", async () => {
  const [mainSource, pageSource] = await Promise.all([
    readFile(new URL("../src/main.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/InputTagsShowcase.jsx", import.meta.url), "utf8"),
  ]);

  assert.match(mainSource, /path="\/componentes\/input-tags"/);
  assert.match(pageSource, /Demo \/ staging/);
  assert.match(pageSource, /createInputTagShowcaseMatrix\(FIGMA_TAGS\)/);
  assert.match(pageSource, /showTagOptionsOnFocus/);
  assert.match(pageSource, /onTagsChange=\{handleTagsChange\}/);
  assert.doesNotMatch(pageSource, /onTagOptionSelect=\{handleOptionSelect\}/);
  assert.match(pageSource, /md:grid-cols-2 xl:grid-cols-3/);
});
