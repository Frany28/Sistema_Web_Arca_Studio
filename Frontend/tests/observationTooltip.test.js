import assert from "node:assert/strict";
import test from "node:test";

import { getObservationAuthorInitials } from "../src/components/ui/ObservationTooltip/observationTooltip.js";

test("observation tooltip derives stable avatar initials", () => {
  assert.equal(getObservationAuthorInitials("Armando Carroz"), "AC");
  assert.equal(getObservationAuthorInitials("Armando"), "AR");
  assert.equal(getObservationAuthorInitials(""), "U");
});
