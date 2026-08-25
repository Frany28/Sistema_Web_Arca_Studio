import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getBulkActionAvailability } from
  "../src/pages/architect-dashboard/components/adminProjectBulkActions.js";
import { getAdminProjectsPagination } from
  "../src/pages/architect-dashboard/components/adminProjectPagination.js";

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

test("the Figma table footer stays visible and exposes functional pagination", async () => {
  const source = await readFile(
    new URL(
      "../src/pages/architect-dashboard/components/AdminActiveProjects.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /<footer[\s\S]*data-selection-footer="true"/,
  );
  assert.match(
    source,
    /\{selectedVisibleCount\} de \{visibleProjects\.length\} seleccionados/,
  );
  assert.match(source, /selectedVisibleCount > 0[\s\S]*Cambiar visibilidad/);
  assert.match(source, />\s*Cambiar visibilidad\s*<\/Button>/);
  assert.match(source, />\s*Archivar\s*<\/Button>/);
  assert.match(source, />\s*Desarchivar\s*<\/Button>/);
  assert.match(source, /type="Outline"[\s\S]*>\s*Anterior\s*<\/Button>/);
  assert.match(source, /type="Solid"[\s\S]*>\s*Siguiente pág\.\s*<\/Button>/);

  assert.match(source, /handleBulkAction\("change_visibility"\)/);
  assert.match(source, /handleBulkAction\("archive"\)/);
  assert.match(source, /handleBulkAction\("unarchive"\)/);
  assert.match(source, /disabled=\{!pagination\.canGoPrevious/);
  assert.match(source, /disabled=\{!pagination\.canGoNext/);
  assert.match(source, /onClick=\{goToPreviousPage\}/);
  assert.match(source, /onClick=\{goToNextPage\}/);
  assert.match(source, /setPageIndex\(pagination\.pageIndex - 1\);[\s\S]*setSelectedProjectIds\(new Set\(\)\)/);
  assert.match(source, /setPageIndex\(pagination\.pageIndex \+ 1\);[\s\S]*setSelectedProjectIds\(new Set\(\)\)/);
  assert.match(source, /await onBulkAction\(\{ action, projects: selectedVisibleProjects \}\)/);
  assert.match(source, /Boolean\(bulkActionPending\)/);
  assert.match(
    source,
    /theme=\{bulkActionFeedback\.type === "error" \? "Danger" : "Success"\}/,
  );
  assert.match(source, /<AlertToast/);
  assert.match(source, /trigger=\{bulkActionFeedback\?\.id\}/);
  assert.match(source, /onDismiss=\{\(\) => setBulkActionFeedback\(null\)\}/);
});

test("admin project pagination clamps pages and reports button states", () => {
  const projects = Array.from({ length: 12 }, (_, index) => ({ id: index + 1 }));

  assert.deepEqual(getAdminProjectsPagination(projects, 0), {
    canGoNext: true,
    canGoPrevious: false,
    pageCount: 3,
    pageIndex: 0,
    pageProjects: projects.slice(0, 5),
  });
  assert.deepEqual(getAdminProjectsPagination(projects, 1), {
    canGoNext: true,
    canGoPrevious: true,
    pageCount: 3,
    pageIndex: 1,
    pageProjects: projects.slice(5, 10),
  });
  assert.deepEqual(getAdminProjectsPagination(projects, 99), {
    canGoNext: false,
    canGoPrevious: true,
    pageCount: 3,
    pageIndex: 2,
    pageProjects: projects.slice(10),
  });
  assert.deepEqual(getAdminProjectsPagination([], 4), {
    canGoNext: false,
    canGoPrevious: false,
    pageCount: 1,
    pageIndex: 0,
    pageProjects: [],
  });
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
      canArchive: false,
      canUnarchive: true,
    },
  );

  assert.deepEqual(
    getBulkActionAvailability([
      { id: 1, status: "completed", isPublic: false },
      { id: 2, status: "finished", isPublic: false },
    ]),
    {
      canChangeVisibility: true,
      canArchive: true,
      canUnarchive: false,
    },
  );

  assert.deepEqual(
    getBulkActionAvailability([
      { id: 1, status: "completed", isPublic: true },
      { id: 2, status: "finished", isPublic: true },
    ]),
    {
      canChangeVisibility: true,
      canArchive: true,
      canUnarchive: false,
    },
  );

  assert.deepEqual(
    getBulkActionAvailability([
      { id: 1, status: "completed", isPublic: true },
      { id: 2, status: "finished", isPublic: false },
    ]),
    {
      canChangeVisibility: false,
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
      canArchive: false,
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
      canArchive: false,
      canUnarchive: false,
    },
  );
});
