const RESOURCE_LINK_KEYS = new Set([
  "src",
  "imagesrc",
  "url",
  "fileurl",
  "downloadurl",
]);

function isResourceLink(value) {
  return (
    typeof value === "string" &&
    /^(?:(?:https?:)?\/\/|s3:\/\/|\/api\/)|\/storage\/v1\/object\//i.test(value.trim())
  );
}

export function sanitizeCommentMetadata(value) {
  if (Array.isArray(value)) {
    return value
      .map(sanitizeCommentMetadata)
      .filter((item) => item !== undefined);
  }

  if (!value || typeof value !== "object") {
    return isResourceLink(value) ? undefined : value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !RESOURCE_LINK_KEYS.has(key.toLowerCase()))
      .map(([key, item]) => [key, sanitizeCommentMetadata(item)])
      .filter(([, item]) => item !== undefined),
  );
}
