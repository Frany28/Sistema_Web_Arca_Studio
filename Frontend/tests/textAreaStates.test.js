import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  resolveTextAreaState,
  TEXT_AREA_STATE_STYLES,
} from "../src/components/ui/TextArea/textAreaConfig.js";

test("textarea interaction states follow the Figma priority", () => {
  assert.equal(resolveTextAreaState(), "Default");
  assert.equal(resolveTextAreaState({ hasValue: true }), "Filled");
  assert.equal(resolveTextAreaState({ hasValue: true, isHovered: true }), "Hover");
  assert.equal(resolveTextAreaState({ hasValue: true, isHovered: true, isFocused: true }), "Focused");
  assert.equal(resolveTextAreaState({ hasValue: true, isFocused: true, state: "Error" }), "Error");
  assert.equal(resolveTextAreaState({ disabled: true, isFocused: true, state: "Error" }), "Disabled");
});

test("textarea forced showcase variants remain stable", () => {
  for (const state of ["Hover", "Focused", "Filled"]) {
    assert.equal(resolveTextAreaState({ state }), state);
  }
});

test("textarea focus matches the Figma ring without changing border geometry", async () => {
  const source = await readFile(
    new URL("../src/components/ui/TextArea/TextArea.jsx", import.meta.url),
    "utf8",
  );

  assert.match(TEXT_AREA_STATE_STYLES.Focused.shell, /border border-\[var\(--color-primary-10\)\]/);
  assert.match(TEXT_AREA_STATE_STYLES.Focused.shell, /0_0_0_3px_var\(--color-primary-10\)/);
  assert.doesNotMatch(TEXT_AREA_STATE_STYLES.Focused.shell, /dark:border|#[\da-f]{3,8}/i);
  assert.match(source, /showHint && resolvedState !== "Focused"/);
});
