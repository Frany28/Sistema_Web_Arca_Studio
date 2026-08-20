import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("EmptyState M follows the Figma component and shared design system", async () => {
  const source = await readFile(
    new URL("../src/components/ui/EmptyState/EmptyState.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /full: "2061:24347"/);
  assert.match(source, /src=\{circlesAsset\}/);
  assert.doesNotMatch(source, /radial-gradient/);
  assert.match(source, /const ImageIcon = IconsaxIcons\.Image/);
  assert.match(source, /isMedium \? "h-\[216px\] w-\[221px\]"/);
  assert.match(source, /isMedium \? "size-\[48px\] p-\[8px\]"/);
  assert.match(source, /isMedium \? "text-heading-6" : "text-heading-7"/);
  assert.match(source, /text-body-3 text-\[var\(--color-text-100\)\]/);
  assert.match(source, /overflow-clip/);
});

test("user management uses full M only for its primary empty collection", async () => {
  const source = await readFile(
    new URL("../src/pages/admin-users/AdminUsersPage.jsx", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /title="No hay usuarios registrados"[\s\S]*size="M"[\s\S]*showFeaturedIcon[\s\S]*showSecondaryAction[\s\S]*secondaryActionLabel="Añadir"[\s\S]*primaryActionLabel="Actualizar"/,
  );
  assert.match(
    source,
    /title="No hay usuarios registrados"[\s\S]*className="min-h-\[320px\] flex-1"/,
  );
  assert.match(
    source,
    /title="No hay coincidencias"[\s\S]*size="S"[\s\S]*showSecondaryAction=\{false\}/,
  );
  assert.match(
    source,
    /title="No se pudieron cargar los usuarios"[\s\S]*showSecondaryAction=\{false\}[\s\S]*primaryActionLabel="Reintentar"/,
  );
});
