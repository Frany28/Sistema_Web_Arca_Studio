import assert from "node:assert/strict";
import test from "node:test";

import {
  filterPublicProjects,
  getPublicGalleryProjects,
  normalizeProjectSearch,
  sortPublicProjects,
} from "../src/utils/publicProjectGallery.js";

const projects = [
  {
    id: 1,
    name: "Baño RD 2026",
    isPublic: true,
    client: { id: 10 },
    assignedArchitect: { id: 20, name: "Ana Pérez" },
    projectType: "residential",
    updatedAt: "2026-05-02T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Muelle Ciudad Ojeda",
    isPublic: true,
    client: { id: 11 },
    assignedArchitect: { id: 21, name: "Luis Díaz" },
    projectType: "corporate",
    updatedAt: "2026-06-02T00:00:00.000Z",
  },
  { id: 3, name: "Privado", isPublic: false, client: { id: 12 } },
];

test("public gallery excludes projects owned by clients and architects", () => {
  assert.deepEqual(
    getPublicGalleryProjects(projects, { role: "client", clientId: 10 }).map(
      (project) => project.id,
    ),
    [2],
  );
  assert.deepEqual(
    getPublicGalleryProjects(projects, { role: "architect", id: 21 }).map(
      (project) => project.id,
    ),
    [1],
  );
  assert.deepEqual(
    getPublicGalleryProjects(projects, { role: "admin" }).map(
      (project) => project.id,
    ),
    [1, 2],
  );
});

test("public gallery search ignores accents and includes type, year and architect", () => {
  assert.equal(normalizeProjectSearch("  BAÑO  "), "bano");
  assert.deepEqual(filterPublicProjects(projects, "Perez").map((item) => item.id), [1]);
  assert.deepEqual(filterPublicProjects(projects, "corporativo").map((item) => item.id), [2]);
  assert.deepEqual(filterPublicProjects(projects, "2026").map((item) => item.id), [1]);
});

test("public gallery sorting is stable by date and id", () => {
  assert.deepEqual(sortPublicProjects(projects, "desc").map((item) => item.id), [2, 1, 3]);
  assert.deepEqual(sortPublicProjects(projects, "asc").map((item) => item.id), [3, 1, 2]);
});

