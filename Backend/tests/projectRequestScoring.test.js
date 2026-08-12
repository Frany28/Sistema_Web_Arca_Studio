import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateProjectCompatibility,
  publicCompatibility,
} from "../src/domain/projectRequest.js";

const READY_PROJECT = {
  capitalAvailability: "available_now",
  developmentMode: "full",
  investmentRange: "under_10k",
  startTime: "3_6_months",
};

test("a prepared and coherent request receives 100 points", () => {
  assert.deepEqual(evaluateProjectCompatibility(READY_PROJECT), {
    level: "excellent",
    reasonCodes: [],
    score: 100,
    version: "1.0",
  });
});

test("higher investment ranges do not add more points", () => {
  const scores = ["under_10k", "10k_50k", "50k_150k", "over_150k"].map(
    (investmentRange) => evaluateProjectCompatibility({ ...READY_PROJECT, investmentRange }).score,
  );
  assert.deepEqual(scores, [100, 100, 100, 100]);
});

test("informational answers do not change the score", () => {
  const baseline = evaluateProjectCompatibility(READY_PROJECT);
  const informational = evaluateProjectCompatibility({
    ...READY_PROJECT,
    decisionMaker: "company_board",
    experience: "negative",
    hasBlueprints: true,
  });
  assert.equal(informational.score, baseline.score);
});

test("incoherent immediate plans apply deterministic deductions", () => {
  const result = evaluateProjectCompatibility({
    capitalAvailability: "undefined",
    developmentMode: "undecided",
    investmentRange: "undefined",
    landStatus: "unavailable",
    startTime: "immediate",
  });
  assert.equal(result.score, 0);
  assert.equal(result.level, "low");
  assert.deepEqual(result.reasonCodes, [
    "capitalUndefinedImmediate",
    "landUnavailableImmediate",
    "budgetUndefinedImmediate",
  ]);
});

test("size and quality deductions never let the score leave the 0-100 range", () => {
  const result = evaluateProjectCompatibility({
    ...READY_PROJECT,
    capitalAvailability: "undefined",
    projectSize: "very_large_gt_500",
    quality: "luxury",
    startTime: "immediate",
  });
  assert.equal(result.score, 8);
  assert.equal(publicCompatibility(result).observations.length, 3);
});

test("score thresholds use 80, 60 and 40", () => {
  const cases = [
    [80, "excellent"],
    [79, "high"],
    [60, "high"],
    [59, "medium"],
    [40, "medium"],
    [39, "low"],
  ];
  for (const [score, level] of cases) {
    assert.equal(publicCompatibility({ score, level, reasonCodes: [] }).level, level);
  }
});
