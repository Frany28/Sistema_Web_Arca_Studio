import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("archived project details propagate one shared read-only policy", async () => {
  const [
    contextSource,
    detailsSource,
    drawerSource,
    uploadSource,
    imageSource,
    videoSource,
    documentSource,
  ] = await Promise.all([
    readFile(new URL("../src/contexts/ProjectReadOnlyContext.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/projects/ProjectDetailsPage.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/Gallery/Model3DViewerModal.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/projects/panels/ProjectUploadFilesPanel.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/Gallery/ImageViewerModal.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/Gallery/VideoViewerModal.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/projects/components/ProjectDocumentPreview.jsx", import.meta.url), "utf8"),
  ]);

  assert.match(contextSource, /Desarchiva el proyecto para realizar cambios/);
  assert.match(detailsSource, /<ProjectReadOnlyProvider readOnly=\{projectIsArchived\}>/);
  assert.match(detailsSource, /title="Proyecto archivado"/);
  assert.match(drawerSource, /resolvedComposerDisabled = composerDisabled \|\| readOnly/);
  assert.match(uploadSource, /<FileUploadSection[\s\S]*disabled=\{readOnly\}/);
  assert.match(imageSource, /onSelectionChange=\{readOnly \? undefined : handleSelectionChange\}/);
  assert.match(videoSource, /onCommentClick=\{readOnly \? undefined : handleCommentClick\}/);
  assert.match(documentSource, /onPointCreate=\{readOnly \? undefined : handleSelectionChange\}/);
});

test("archived projects disable dashboard mutations but keep unarchive selection", async () => {
  const [dashboardSource, rowSource] = await Promise.all([
    readFile(new URL("../src/pages/architect-dashboard/components/AdminActiveProjects.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/architect-dashboard/components/ArchitectProjectRow.jsx", import.meta.url), "utf8"),
  ]);

  assert.match(dashboardSource, /disabled=\{isArchived\}/);
  assert.match(dashboardSource, /primaryActionDisabled=\{assigneeUndoUnavailable\}/);
  assert.match(rowSource, /disabled=\{project\.status === "archived"\}/);
});
