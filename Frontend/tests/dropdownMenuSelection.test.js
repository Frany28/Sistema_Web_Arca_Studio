import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { updateDropdownCheckboxItems } from
  "../src/components/ui/DropdownMenu/dropdownMenuSelection.js";

const items = [
  { id: "one", label: "Uno", checked: "Yes" },
  { id: "two", label: "Dos", checked: "No" },
  { id: "three", label: "Tres", checked: "No" },
];

test("multiple dropdown selection preserves previous checks", () => {
  assert.deepEqual(updateDropdownCheckboxItems(items, "two", true), [
    { id: "one", label: "Uno", checked: "Yes" },
    { id: "two", label: "Dos", checked: "Yes" },
    { id: "three", label: "Tres", checked: "No" },
  ]);
});

test("multiple dropdown selection can uncheck an item", () => {
  assert.deepEqual(updateDropdownCheckboxItems(items, "one", true), [
    { id: "one", label: "Uno", checked: "No" },
    { id: "two", label: "Dos", checked: "No" },
    { id: "three", label: "Tres", checked: "No" },
  ]);
});

test("single dropdown selection remains exclusive", () => {
  assert.deepEqual(updateDropdownCheckboxItems(items, "two", false), [
    { id: "one", label: "Uno", checked: "No" },
    { id: "two", label: "Dos", checked: "Yes" },
    { id: "three", label: "Tres", checked: "No" },
  ]);
});

test("composite checkbox options preserve selection while hovered", async () => {
  const dropdownSource = await readFile(
    new URL(
      "../src/components/ui/DropdownMenu/DropdownMenu.jsx",
      import.meta.url,
    ),
    "utf8",
  );
  const projectRequestSource = await readFile(
    new URL("../src/pages/ProjectRequestPage.jsx", import.meta.url),
    "utf8",
  );

  assert.match(
    dropdownSource,
    /const resolvedChecked = visualState === "Selected" \? "Yes" : checked/,
  );
  assert.doesNotMatch(
    dropdownSource,
    /visualState === "Hover"\s*\?\s*"No"\s*:\s*checked/,
  );
  assert.match(projectRequestSource, /setHoveredDocumentType\(option\.value\)/);
  assert.match(
    projectRequestSource,
    /state=\{hoveredDocumentType === option\.value \? "Hover" : undefined\}/,
  );
});

test("dropdown content overlaps the trigger border without a visible gap", async () => {
  const dropdownSource = await readFile(
    new URL(
      "../src/components/ui/DropdownMenu/DropdownMenu.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(dropdownSource, /top-\[calc\(100%_-_1px\)\]/);
  assert.doesNotMatch(dropdownSource, /absolute left-0 top-full/);
});
