export function getVisibleProjectStages(stages) {
  const normalizedStages = Array.isArray(stages) ? stages : [];

  return normalizedStages.slice(0, 4);
}
