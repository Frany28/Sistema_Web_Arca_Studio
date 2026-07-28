export function getVisibleProjectStages(stages) {
  const normalizedStages = Array.isArray(stages) ? stages : [];
  const activeStageIndex = normalizedStages.findIndex(
    (stage) => stage.tone === "active",
  );
  const currentStageIndex = activeStageIndex >= 0 ? activeStageIndex : 0;

  return normalizedStages.slice(currentStageIndex, currentStageIndex + 4);
}
