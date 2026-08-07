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
