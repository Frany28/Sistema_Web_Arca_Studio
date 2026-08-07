export function canShowPanoramaAnnotations({
  isLoading,
  loadState,
  viewerLoaded,
  visible,
}) {
  return Boolean(
    visible &&
      !isLoading &&
      loadState === "loaded" &&
      viewerLoaded,
  );
}

export function canObservePanoramaViewer({
  hasInteractiveModel,
  shouldRender,
  viewerAvailable,
  visible,
}) {
  return Boolean(
    visible && shouldRender && hasInteractiveModel && viewerAvailable,
  );
}
