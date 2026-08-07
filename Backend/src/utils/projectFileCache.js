const IMMUTABLE_CACHE_SECONDS = 31_536_000;
const FALLBACK_CACHE_SECONDS = 300;

function toPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function getProjectFileCacheHeaders({
  currentVersionId,
  fileId,
  requestedVersionId,
}) {
  const safeCurrentVersionId = toPositiveInteger(currentVersionId);
  const safeRequestedVersionId = toPositiveInteger(requestedVersionId);
  const safeFileId = toPositiveInteger(fileId);
  const isCurrentVersion =
    safeCurrentVersionId !== null &&
    safeRequestedVersionId === safeCurrentVersionId;

  return {
    cacheControl: isCurrentVersion
      ? `private, max-age=${IMMUTABLE_CACHE_SECONDS}, immutable`
      : `private, max-age=${FALLBACK_CACHE_SECONDS}`,
    etag:
      safeFileId && safeCurrentVersionId
        ? `"project-file-${safeFileId}-version-${safeCurrentVersionId}"`
        : null,
  };
}
