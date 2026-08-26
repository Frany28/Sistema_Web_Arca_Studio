import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("alert toast floats over the viewport and reuses notification transitions", async () => {
  const [source, alertSource] = await Promise.all([
    readFile(
      new URL("../src/components/ui/AlertToast/AlertToast.jsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/ui/Alert/Alert.jsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(source, /createPortal/);
  assert.match(source, /fixed inset-x-0 bottom-0/);
  assert.match(source, /sm:right-0/);
  assert.match(source, /auth-toast auth-toast--visible/);
  assert.match(source, /autoHideMs = 5000/);
  assert.match(source, /getUserFacingErrorMessage\(description\)/);
  assert.match(source, /onDismiss=\{dismiss\}/);
  assert.match(alertSource, /aria-label="Cerrar alerta"[\s\S]*tooltip=\{false\}/);
});
