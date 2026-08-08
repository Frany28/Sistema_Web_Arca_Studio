import assert from "node:assert/strict";
import test from "node:test";

import { resolveIconButtonTooltip } from "../src/components/ui/Button/buttonTooltip.js";

test("icon-only buttons use their accessible name as tooltip text", () => {
  assert.equal(
    resolveIconButtonTooltip({
      ariaLabel: "Cerrar sesión",
      showText: false,
    }),
    "Cerrar sesión",
  );
});

test("an explicit tooltip overrides the accessible name", () => {
  assert.equal(
    resolveIconButtonTooltip({
      ariaLabel: "Cambiar estado",
      showText: false,
      tooltip: "Marcar como completado",
    }),
    "Marcar como completado",
  );
});

test("buttons with visible text do not generate an automatic tooltip", () => {
  assert.equal(
    resolveIconButtonTooltip({
      ariaLabel: "Guardar",
      showText: true,
      tooltip: "Guardar cambios",
    }),
    null,
  );
});

test("an icon-only button without useful information gets no empty tooltip", () => {
  assert.equal(
    resolveIconButtonTooltip({ ariaLabel: "   ", showText: false }),
    null,
  );
});
