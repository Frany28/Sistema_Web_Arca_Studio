import assert from "node:assert/strict";
import test from "node:test";

import {
  compatibilityLevel,
  evaluateProjectCompatibility,
  publicCompatibility,
} from "../src/domain/projectRequest.js";

const COMPLETE_PROJECT = {
  capitalAvailability: "available_now",
  decisionMaker: "self",
  description: "Proyecto residencial con remodelación integral, alcance definido y documentación legal disponible.",
  developmentMode: "full",
  hasFiles: true,
  hasPlans: true,
  investmentRange: "over_150k",
  landStatus: "available",
  legalDocumentationStatus: "available",
  legalDocumentTypes: ["property_deed"],
  location: "Caracas, Venezuela",
  projectName: "Apartamento Central",
  projectSize: "small_lt_80",
  projectType: "residential",
  referenceLink: "https://example.com/referencia",
  startTime: "immediate",
};

test("a complete, prepared and coherent request receives 100 points in version 2.2", () => {
  assert.deepEqual(evaluateProjectCompatibility(COMPLETE_PROJECT), {
    level: "excellent",
    reasonCodes: [],
    score: 100,
    version: "2.2",
  });
});

test("name, type, location and start time do not contribute base points", () => {
  const baseline = evaluateProjectCompatibility(COMPLETE_PROJECT).score;
  for (const values of [
    { projectName: null },
    { projectType: null },
    { location: null },
    { startTime: "1_3_months" },
    { startTime: "3_6_months" },
    { startTime: "over_6_months" },
  ]) {
    assert.equal(
      evaluateProjectCompatibility({ ...COMPLETE_PROJECT, ...values }).score,
      baseline,
    );
  }
});

test("every defined investment range contributes the same 15 base points", () => {
  const scores = ["under_10k", "10k_50k", "50k_150k", "over_150k"].map(
    (investmentRange) =>
      evaluateProjectCompatibility({ ...COMPLETE_PROJECT, investmentRange }).score,
  );
  assert.deepEqual(scores, [100, 100, 100, 100]);
});

test("every defined project size contributes the same 15 base points", () => {
  const scores = [
    "small_lt_80",
    "medium_80_200",
    "large_200_500",
    "very_large_gt_500",
  ].map((projectSize) =>
    evaluateProjectCompatibility({ ...COMPLETE_PROJECT, projectSize }).score,
  );
  assert.deepEqual(scores, [100, 100, 100, 100]);
});

test("experience, decision maker and number of owners never change the score", () => {
  const baseline = evaluateProjectCompatibility(COMPLETE_PROJECT).score;
  for (const values of [
    { experience: "positive", hasMultipleOwners: false },
    { experience: "negative", hasMultipleOwners: true },
    { experience: "first_time" },
    { decisionMaker: "partner" },
    { decisionMaker: "extended_family" },
    { decisionMaker: "company_board" },
  ]) {
    assert.equal(
      evaluateProjectCompatibility({ ...COMPLETE_PROJECT, ...values }).score,
      baseline,
    );
  }
});

test("description completeness contributes points without duplicate deductions", () => {
  assert.deepEqual(
    evaluateProjectCompatibility({ ...COMPLETE_PROJECT, description: "Descripción suficiente para evaluar alcance." }),
    { level: "excellent", reasonCodes: [], score: 94, version: "2.2" },
  );
  assert.deepEqual(
    evaluateProjectCompatibility({ ...COMPLETE_PROJECT, description: null }),
    { level: "excellent", reasonCodes: [], score: 90, version: "2.2" },
  );
});

test("scope and financial readiness use the redistributed base points", () => {
  const cases = [
    [85, { projectSize: "unknown" }],
    [90, { developmentMode: "undecided", startTime: "3_6_months" }],
    [95, { landStatus: "acquiring", startTime: "3_6_months" }],
    [90, { landStatus: "unavailable", startTime: "3_6_months" }],
    [85, { investmentRange: "undefined", startTime: "3_6_months" }],
    [95, { capitalAvailability: "within_3_months", startTime: "3_6_months" }],
    [85, { capitalAvailability: "seeking_financing", startTime: "3_6_months" }],
    [75, { capitalAvailability: "undefined", startTime: "3_6_months" }],
  ];
  for (const [expectedScore, values] of cases) {
    assert.equal(
      evaluateProjectCompatibility({ ...COMPLETE_PROJECT, ...values }).score,
      expectedScore,
    );
  }
});

test("files and valid reference links contribute only 5 and 2 points", () => {
  assert.equal(
    evaluateProjectCompatibility({ ...COMPLETE_PROJECT, hasFiles: false }).score,
    95,
  );
  assert.equal(
    evaluateProjectCompatibility({ ...COMPLETE_PROJECT, referenceLink: null }).score,
    98,
  );
  assert.equal(
    evaluateProjectCompatibility({
      ...COMPLETE_PROJECT,
      hasFiles: false,
      referenceLink: null,
    }).score,
    93,
  );
  assert.equal(
    evaluateProjectCompatibility({
      ...COMPLETE_PROJECT,
      referenceLink: "javascript:alert(1)",
    }).score,
    98,
  );
});

test("legal readiness and plans add preparation points without favoring document types", () => {
  assert.equal(
    evaluateProjectCompatibility({
      ...COMPLETE_PROJECT,
      legalDocumentTypes: ["lease_contract"],
    }).score,
    100,
  );
  assert.equal(
    evaluateProjectCompatibility({
      ...COMPLETE_PROJECT,
      legalDocumentTypes: ["property_deed", "purchase_contract", "other"],
    }).score,
    100,
  );
  assert.equal(
    evaluateProjectCompatibility({
      ...COMPLETE_PROJECT,
      legalDocumentationStatus: "in_process",
      legalDocumentTypes: [],
    }).score,
    97,
  );
  assert.equal(
    evaluateProjectCompatibility({
      ...COMPLETE_PROJECT,
      legalDocumentationStatus: "unavailable",
      legalDocumentTypes: [],
    }).score,
    94,
  );
  assert.equal(
    evaluateProjectCompatibility({ ...COMPLETE_PROJECT, hasPlans: false }).score,
    98,
  );
});

const PENALTY_CASES = [
  ["mediumBudgetUnder10k", 90, { investmentRange: "under_10k", projectSize: "medium_80_200" }],
  ["largeBudgetUnder10k", 75, { investmentRange: "under_10k", projectSize: "large_200_500" }],
  ["veryLargeBudgetUnder10k", 65, { investmentRange: "under_10k", projectSize: "very_large_gt_500" }],
  ["veryLargeBudget10k50k", 75, { investmentRange: "10k_50k", projectSize: "very_large_gt_500" }],
  ["largeBudgetUndefined", 70, { investmentRange: "undefined", projectSize: "large_200_500", startTime: "3_6_months" }],
  ["veryLargeBudgetUndefined", 65, { investmentRange: "undefined", projectSize: "very_large_gt_500", startTime: "3_6_months" }],
  ["premiumBudgetUnder10k", 80, { investmentRange: "under_10k", quality: "premium" }],
  ["luxuryBudgetUnder10k", 70, { investmentRange: "under_10k", quality: "luxury" }],
  ["luxuryBudget10k50k", 80, { investmentRange: "10k_50k", quality: "luxury" }],
  ["premiumBudgetUndefined", 70, { investmentRange: "undefined", quality: "premium", startTime: "3_6_months" }],
  ["luxuryBudgetUndefined", 65, { investmentRange: "undefined", quality: "luxury", startTime: "3_6_months" }],
  ["landUnavailableImmediate", 70, { landStatus: "unavailable" }],
  ["landAcquiringImmediate", 85, { landStatus: "acquiring" }],
  ["capitalUndefinedImmediate", 55, { capitalAvailability: "undefined", investmentRange: "over_150k" }],
  ["financingImmediate", 70, { capitalAvailability: "seeking_financing" }],
  ["capitalWithin3MonthsImmediate", 85, { capitalAvailability: "within_3_months" }],
  ["landUnavailableSoon", 80, { landStatus: "unavailable", startTime: "1_3_months" }],
  ["capitalUndefinedSoon", 65, { capitalAvailability: "undefined", startTime: "1_3_months" }],
  ["financingSoon", 77, { capitalAvailability: "seeking_financing", startTime: "1_3_months" }],
  ["budgetUndefinedImmediate", 75, { investmentRange: "undefined" }],
  ["budgetUndefinedSoon", 80, { investmentRange: "undefined", startTime: "1_3_months" }],
  ["modeUndefinedImmediate", 80, { developmentMode: "undecided" }],
];

test("every objective coherence penalty is applied with its exact value", () => {
  for (const [reasonCode, expectedScore, values] of PENALTY_CASES) {
    const evaluation = evaluateProjectCompatibility({ ...COMPLETE_PROJECT, ...values });
    assert.ok(evaluation.reasonCodes.includes(reasonCode), reasonCode);
    assert.equal(evaluation.score, expectedScore, reasonCode);
  }
});

test("quality only changes the score through budget coherence rules", () => {
  assert.equal(
    evaluateProjectCompatibility({ ...COMPLETE_PROJECT, quality: "luxury" }).score,
    100,
  );
  assert.equal(
    evaluateProjectCompatibility({
      ...COMPLETE_PROJECT,
      investmentRange: "under_10k",
      quality: "luxury",
    }).score,
    70,
  );
});

test("missing information is not deducted twice", () => {
  const result = evaluateProjectCompatibility({
    ...COMPLETE_PROJECT,
    description: "Descripción suficiente para evaluar alcance.",
    hasFiles: false,
    investmentRange: "undefined",
    projectSize: "unknown",
    referenceLink: null,
    startTime: "3_6_months",
  });
  assert.equal(result.score, 57);
  assert.deepEqual(result.reasonCodes, []);
});

test("the final score stays within 0-100 and exposes at most three observations", () => {
  const result = evaluateProjectCompatibility({
    ...COMPLETE_PROJECT,
    capitalAvailability: "undefined",
    description: null,
    hasFiles: false,
    investmentRange: "under_10k",
    landStatus: "unavailable",
    projectSize: "very_large_gt_500",
    quality: "luxury",
    referenceLink: null,
  });
  assert.equal(result.score, 0);
  assert.equal(result.level, "poorly_defined");
  assert.equal(result.reasonCodes.length, 3);
  assert.equal(publicCompatibility(result).observations.length, 3);
});

test("score thresholds use 80, 60, 40 and 20", () => {
  const cases = [
    [100, "excellent"],
    [80, "excellent"],
    [79, "high"],
    [60, "high"],
    [59, "medium"],
    [40, "medium"],
    [39, "low"],
    [20, "low"],
    [19, "poorly_defined"],
    [0, "poorly_defined"],
  ];
  for (const [score, level] of cases) {
    assert.equal(compatibilityLevel(score), level);
  }
});

test("public compatibility preserves historical results without recalculating them", () => {
  for (const version of ["1.0", "2.0", "2.1"]) {
    assert.deepEqual(
      publicCompatibility({
        level: "low",
        reasonCodes: ["companyImmediate"],
        score: 22,
        version,
      }),
      {
        level: "low",
        observations: [
          "Un inicio inmediato debe coordinarse con el proceso de decisión de la empresa o junta.",
        ],
        score: 22,
      },
    );
  }
});
