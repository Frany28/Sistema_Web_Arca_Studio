export function getPublicGalleryColumnCount(viewportWidth) {
  const width = Number(viewportWidth) || 1280;
  if (width < 768) return 1;
  if (width < 1024) return 2;
  return 3;
}
