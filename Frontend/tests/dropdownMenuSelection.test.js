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

test("multiple dropdown can close after selection without becoming exclusive", async () => {
  const source = await readFile(
    new URL(
      "../src/components/ui/DropdownMenu/DropdownMenu.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /closeOnSelect = false/);
  assert.match(source, /if \(!multiple \|\| closeOnSelect\)/);
});
