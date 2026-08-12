import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProjectRequestPayload,
  getProjectRequestFieldErrors,
  getProjectRequestFileErrors,
} from "../src/utils/projectRequestValidation.js";

const VALID_VALUES = {
  capitalAvailability: "undefined",
  description: "",
  developmentMode: "undecided",
  investmentRange: "undefined",
  location: "Maracaibo, Estado Zulia",
  projectName: "Casa Jardín",
  projectType: "residential",
  referenceLink: "",
  startTime: "over_6_months",
};

test("project request validation accepts configured stable values", () => {
  assert.deepEqual(getProjectRequestFieldErrors(VALID_VALUES), {});
});

test("project request validation reports field-specific errors", () => {
  const errors = getProjectRequestFieldErrors({ ...VALID_VALUES, projectName: "x", referenceLink: "javascript:test" });
  assert.match(errors.projectName, /3 caracteres/);
  assert.match(errors.referenceLink, /http/);
});

test("optional description is validated only when provided", () => {
  assert.equal(getProjectRequestFieldErrors({ ...VALID_VALUES, description: "" }).description, undefined);
  assert.ok(getProjectRequestFieldErrors({ ...VALID_VALUES, description: "muy corta" }).description);
});

test("file validation enforces extension, mime, size and duplicate names", () => {
  const validFile = { name: "referencia.jpg", size: 100, type: "image/jpeg" };
  assert.deepEqual(getProjectRequestFileErrors([validFile]), []);
  const errors = getProjectRequestFileErrors([
    validFile,
    { ...validFile },
    { name: "script.jpg", size: 100, type: "application/javascript" },
  ]);
  assert.ok(errors.some((error) => error.includes("repetido")));
  assert.ok(errors.some((error) => error.includes("formato")));
});

test("payload never includes the temporary code or computed score", () => {
  const payload = buildProjectRequestPayload({
    ...VALID_VALUES,
    code: "123456",
    compatibilityScore: 100,
    hasBlueprints: "Indeterminate",
  }, "550e8400-e29b-41d4-a716-446655440000");
  assert.equal(payload.code, undefined);
  assert.equal(payload.compatibilityScore, undefined);
  assert.equal(payload.hasBlueprints, null);
  assert.equal(payload.submissionId, "550e8400-e29b-41d4-a716-446655440000");
});
