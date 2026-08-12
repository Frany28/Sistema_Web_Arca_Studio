import assert from "node:assert/strict";
import test from "node:test";

import {
  createProjectRequestSchema,
  updateProjectRequestSchema,
} from "../src/validation/projectRequestSchemas.js";

const VALID_BODY = {
  capitalAvailability: "available_now",
  decisionMaker: null,
  description: null,
  developmentMode: "full",
  experience: null,
  hasBlueprints: null,
  investmentRange: "10k_50k",
  landStatus: null,
  projectLocation: "Caracas, Venezuela",
  projectLocationFormattedAddress: null,
  projectLocationLatitude: null,
  projectLocationLongitude: null,
  projectLocationProviderPlaceId: null,
  projectName: "Apartamento Central",
  projectSize: null,
  projectType: "residential",
  quality: null,
  referenceLink: null,
  startTime: "1_3_months",
};

test("create schema accepts the complete normalized contract", () => {
  const result = createProjectRequestSchema.safeParse({
    body: { ...VALID_BODY, submissionId: "550e8400-e29b-41d4-a716-446655440000" },
  });
  assert.equal(result.success, true);
});

test("description is optional but validated when present", () => {
  assert.equal(updateProjectRequestSchema.safeParse({ body: VALID_BODY, params: { projectRequestId: "1" } }).success, true);
  assert.equal(updateProjectRequestSchema.safeParse({ body: { ...VALID_BODY, description: "corta" }, params: { projectRequestId: "1" } }).success, false);
});

test("coordinates must be paired and bounded", () => {
  assert.equal(createProjectRequestSchema.safeParse({ body: { ...VALID_BODY, projectLocationLatitude: 10, submissionId: "550e8400-e29b-41d4-a716-446655440000" } }).success, false);
  assert.equal(createProjectRequestSchema.safeParse({ body: { ...VALID_BODY, projectLocationLatitude: 91, projectLocationLongitude: -66, submissionId: "550e8400-e29b-41d4-a716-446655440000" } }).success, false);
});

test("unknown and sensitive fields are rejected", () => {
  for (const field of ["code", "compatibilityScore", "clientId", "status"]) {
    const result = createProjectRequestSchema.safeParse({
      body: { ...VALID_BODY, [field]: "123456", submissionId: "550e8400-e29b-41d4-a716-446655440000" },
    });
    assert.equal(result.success, false, field);
  }
});

test("only http and https reference links are accepted", () => {
  assert.equal(createProjectRequestSchema.safeParse({ body: { ...VALID_BODY, referenceLink: "javascript:alert(1)", submissionId: "550e8400-e29b-41d4-a716-446655440000" } }).success, false);
});
