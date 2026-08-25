import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getBulkActionAvailability } from
  "../src/pages/architect-dashboard/components/adminProjectBulkActions.js";

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
  assert.match(
    source,
    /<table className="w-full min-w-\[1093px\] table-fixed border-collapse text-left">/,
  );
});

test("the Figma bulk action footer appears only with selected projects", async () => {
  const source = await readFile(
    new URL(
      "../src/pages/architect-dashboard/components/AdminActiveProjects.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /selectedVisibleCount > 0[\s\S]*data-selection-footer="true"/,
  );
  assert.match(
    source,
    /\{selectedVisibleCount\} de \{visibleProjects\.length\} seleccionados/,
  );
  assert.match(source, />\s*Cambiar visibilidad\s*<\/Button>/);
  assert.match(source, />\s*Archivar\s*<\/Button>/);
  assert.match(source, />\s*Desarchivar\s*<\/Button>/);
  assert.match(source, /type="Outline"[\s\S]*>\s*Anterior\s*<\/Button>/);
  assert.match(source, /type="Solid"[\s\S]*>\s*Siguiente pág\.\s*<\/Button>/);

  assert.match(source, /handleBulkAction\("change_visibility"\)/);
  assert.match(source, /handleBulkAction\("archive"\)/);
  assert.match(source, /handleBulkAction\("unarchive"\)/);
  assert.match(source, /await onBulkAction\(\{ action, projects: selectedVisibleProjects \}\)/);
  assert.match(source, /Boolean\(bulkActionPending\)/);
  assert.match(
    source,
    /theme=\{bulkActionFeedback\.type === "error" \? "Danger" : "Success"\}/,
  );
  assert.match(source, /layout="Box"/);
  assert.match(source, /showActions=\{false\}/);
  assert.match(source, /onDismiss=\{\(\) => setBulkActionFeedback\(null\)\}/);
});

test("bulk project actions follow the selection rules", () => {
  assert.deepEqual(getBulkActionAvailability([]), {
    canChangeVisibility: false,
    canArchive: false,
    canUnarchive: false,
  });

  assert.deepEqual(
    getBulkActionAvailability([
      { id: 1, status: "archived" },
      { id: 2, status: "archived" },
    ]),
    {
      canChangeVisibility: false,
      canArchive: true,
      canUnarchive: true,
    },
  );

  assert.deepEqual(
    getBulkActionAvailability([
      { id: 1, status: "completed" },
      { id: 2, status: "finished" },
    ]),
    {
      canChangeVisibility: true,
      canArchive: true,
      canUnarchive: false,
    },
  );

  assert.deepEqual(
    getBulkActionAvailability([
      { id: 1, status: "completed" },
      { id: 2, status: "in_process" },
    ]),
    {
      canChangeVisibility: false,
      canArchive: true,
      canUnarchive: false,
    },
  );

  assert.deepEqual(
    getBulkActionAvailability([
      { id: 1, status: "completed", deletedAt: "2026-08-24T00:00:00Z" },
      { id: 2, status: "completed", archived: true },
    ]),
    {
      canChangeVisibility: false,
      canArchive: true,
      canUnarchive: true,
    },
  );

  assert.deepEqual(
    getBulkActionAvailability([
      { id: 1, status: "completed", isArchived: true },
      { id: 2, status: "completed" },
    ]),
    {
      canChangeVisibility: false,
      canArchive: true,
      canUnarchive: false,
    },
  );
});
