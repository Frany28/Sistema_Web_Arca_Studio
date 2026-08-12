export const PROJECT_REQUEST_VALUES = {
  capitalAvailability: [
    "available_now",
    "within_3_months",
    "seeking_financing",
    "undefined",
  ],
  decisionMaker: ["self", "partner", "extended_family", "company_board"],
  developmentMode: ["phased", "full", "undecided"],
  experience: ["positive", "negative", "first_time"],
  investmentRange: [
    "undefined",
    "under_10k",
    "10k_50k",
    "50k_150k",
    "over_150k",
  ],
  landStatus: ["available", "acquiring", "unavailable"],
  projectSize: [
    "small_lt_80",
    "medium_80_200",
    "large_200_500",
    "very_large_gt_500",
    "unknown",
  ],
  projectType: [
    "residential",
    "commercial",
    "corporate",
    "stands_exhibitions",
  ],
  quality: ["functional_economic", "standard", "premium", "luxury"],
  startTime: ["immediate", "1_3_months", "3_6_months", "over_6_months"],
};

export const COMPATIBILITY_SCORING_VERSION = "1.0";

export const COMPATIBILITY_OBSERVATIONS = {
  budgetUndefinedImmediate:
    "Conviene definir el rango de inversión antes de iniciar de inmediato.",
  budgetUndefinedSoon:
    "Definir el rango de inversión ayudará a preparar el inicio en los próximos meses.",
  capitalUndefinedImmediate:
    "La disponibilidad de capital necesita aclararse para un inicio inmediato.",
  capitalUndefinedSoon:
    "La disponibilidad de capital necesita aclararse para iniciar en los próximos meses.",
  financingImmediate:
    "El financiamiento debe estar encaminado antes de plantear un inicio inmediato.",
  financingSoon:
    "El financiamiento debe coordinarse con el plazo de inicio seleccionado.",
  landAcquiringImmediate:
    "La adquisición del inmueble debe coordinarse con el inicio inmediato.",
  landUnavailableImmediate:
    "Se necesita definir el inmueble antes de iniciar de inmediato.",
  landUnavailableSoon:
    "Se necesita avanzar en la definición del inmueble antes del inicio previsto.",
  luxuryBudgetUnder10k:
    "El nivel exclusivo o de lujo requiere revisar su coherencia con el rango de inversión.",
  mediumBudgetUnder10k:
    "El rango de inversión requiere revisión para el tamaño mediano indicado.",
  modeUndefinedImmediate:
    "Conviene definir la modalidad de desarrollo antes de iniciar de inmediato.",
  premiumBudgetUnder10k:
    "El nivel premium requiere revisar su coherencia con el rango de inversión.",
  largeBudgetUnder10k:
    "El rango de inversión requiere revisión para el tamaño grande indicado.",
  largeBudget10k50k:
    "El alcance y el rango de inversión del proyecto grande necesitan alinearse.",
  veryLargeBudgetUnder10k:
    "El rango de inversión requiere revisión para el tamaño muy grande indicado.",
  veryLargeBudget10k50k:
    "El alcance y el rango de inversión del proyecto muy grande necesitan alinearse.",
  capitalWithin3MonthsImmediate:
    "La disponibilidad de capital en tres meses debe coordinarse con el inicio inmediato.",
};

const BASE_SCORE = {
  capitalAvailability: {
    available_now: 35,
    within_3_months: 28,
    seeking_financing: 15,
    undefined: 5,
  },
  developmentMode: { phased: 20, full: 20, undecided: 5 },
  investmentRange: {
    undefined: 5,
    under_10k: 25,
    "10k_50k": 25,
    "50k_150k": 25,
    over_150k: 25,
  },
};

function compatibilityLevel(score) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function evaluateProjectCompatibility(payload) {
  let score =
    BASE_SCORE.investmentRange[payload.investmentRange] +
    BASE_SCORE.capitalAvailability[payload.capitalAvailability] +
    BASE_SCORE.developmentMode[payload.developmentMode] +
    20;
  const deductions = [];

  const deduct = (code, points) => {
    deductions.push({ code, points });
    score -= points;
  };

  if (payload.startTime === "immediate") {
    if (payload.capitalAvailability === "within_3_months") {
      deduct("capitalWithin3MonthsImmediate", 10);
    } else if (payload.capitalAvailability === "seeking_financing") {
      deduct("financingImmediate", 18);
    } else if (payload.capitalAvailability === "undefined") {
      deduct("capitalUndefinedImmediate", 22);
    }

    if (payload.landStatus === "acquiring") deduct("landAcquiringImmediate", 6);
    if (payload.landStatus === "unavailable") deduct("landUnavailableImmediate", 12);
    if (payload.investmentRange === "undefined") deduct("budgetUndefinedImmediate", 10);
    if (payload.developmentMode === "undecided") deduct("modeUndefinedImmediate", 6);
  }

  if (payload.startTime === "1_3_months") {
    if (payload.capitalAvailability === "seeking_financing") deduct("financingSoon", 8);
    if (payload.capitalAvailability === "undefined") deduct("capitalUndefinedSoon", 12);
    if (payload.landStatus === "unavailable") deduct("landUnavailableSoon", 6);
    if (payload.investmentRange === "undefined") deduct("budgetUndefinedSoon", 5);
  }

  if (payload.investmentRange === "under_10k") {
    if (payload.projectSize === "medium_80_200") deduct("mediumBudgetUnder10k", 10);
    if (payload.projectSize === "large_200_500") deduct("largeBudgetUnder10k", 20);
    if (payload.projectSize === "very_large_gt_500") deduct("veryLargeBudgetUnder10k", 25);
    if (payload.quality === "premium") deduct("premiumBudgetUnder10k", 8);
    if (payload.quality === "luxury") deduct("luxuryBudgetUnder10k", 15);
  }

  if (payload.investmentRange === "10k_50k") {
    if (payload.projectSize === "large_200_500") deduct("largeBudget10k50k", 8);
    if (payload.projectSize === "very_large_gt_500") deduct("veryLargeBudget10k50k", 15);
  }

  const normalizedScore = Math.max(0, Math.min(100, score));
  const reasonCodes = deductions
    .sort((left, right) => right.points - left.points)
    .slice(0, 3)
    .map(({ code }) => code);

  return {
    level: compatibilityLevel(normalizedScore),
    reasonCodes,
    score: normalizedScore,
    version: COMPATIBILITY_SCORING_VERSION,
  };
}

export function publicCompatibility(evaluation) {
  if (!evaluation || evaluation.score === null || evaluation.score === undefined) {
    return null;
  }

  return {
    level: evaluation.level,
    observations: (evaluation.reasonCodes || [])
      .map((code) => COMPATIBILITY_OBSERVATIONS[code])
      .filter(Boolean)
      .slice(0, 3),
    score: Number(evaluation.score),
  };
}
