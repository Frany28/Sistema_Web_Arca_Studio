import assert from "node:assert/strict";
import test from "node:test";

import { mapAdminDashboardMetrics } from "../src/utils/adminDashboardMetrics.js";

test("admin dashboard metrics normalize PostgreSQL aggregate values", () => {
  assert.deepEqual(
    mapAdminDashboardMetrics({
      active_projects_this_month: "2",
      active_projects_total: "12",
      active_users_this_month: "4",
      active_users_total: "32",
      critical_events_total: "2",
      files_total: "184",
      files_total_bytes: "197568495616",
      files_latest_upload_at: "2026-06-19T13:34:00.000Z",
      latest_critical_event_at: "2026-08-14T12:00:00.000Z",
      requests_today: "2",
      requests_total: "4",
    }),
    {
      activeProjects: { thisMonth: 2, total: 12 },
      activeUsers: { thisMonth: 4, total: 32 },
      criticalEvents: {
        latestAt: "2026-08-14T12:00:00.000Z",
        total: 2,
      },
      files: {
        latestUploadAt: "2026-06-19T13:34:00.000Z",
        total: 184,
        totalBytes: 197568495616,
      },
      requests: { today: 2, total: 4 },
    },
  );
});

test("admin dashboard metrics use safe zero defaults", () => {
  assert.deepEqual(mapAdminDashboardMetrics(), {
    activeProjects: { thisMonth: 0, total: 0 },
    activeUsers: { thisMonth: 0, total: 0 },
    criticalEvents: { latestAt: null, total: 0 },
    files: { latestUploadAt: null, total: 0, totalBytes: 0 },
    requests: { today: 0, total: 0 },
  });
});

test("admin dashboard file metrics include the latest non-deleted upload", async () => {
  const repository = await import("node:fs/promises").then(({ readFile }) => readFile(
    new URL("../src/repositories/adminDashboardRepository.js", import.meta.url),
    "utf8",
  ));

  assert.match(repository, /max\(file_version\.created_at\)[\s\S]*as files_latest_upload_at/);
  assert.match(repository, /file_version\.deleted_at is null/);
  assert.match(repository, /file\.status <> 'deleted' and file\.deleted_at is null/);
});
