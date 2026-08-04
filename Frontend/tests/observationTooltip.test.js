import assert from "node:assert/strict";
import test from "node:test";

import {
  formatObservationReplyCount,
  getObservationAuthorInitials,
} from "../src/components/ui/ObservationTooltip/observationTooltip.js";

test("observation tooltip derives stable avatar initials", () => {
  assert.equal(getObservationAuthorInitials("Armando Carroz"), "AC");
  assert.equal(getObservationAuthorInitials("Armando"), "AR");
  assert.equal(getObservationAuthorInitials(""), "U");
});

test("observation tooltip formats live reply totals", () => {
  assert.equal(formatObservationReplyCount(0), "0 respuestas");
  assert.equal(formatObservationReplyCount(1), "1 respuesta");
  assert.equal(formatObservationReplyCount(3), "3 respuestas");
});
