const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export function parsePageLimit(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export function encodeCursor(values) {
  return Buffer.from(JSON.stringify(values), "utf8").toString("base64url");
}

export function decodeCursor(value, expectedLength = 2) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(value), "base64url").toString("utf8"));
    return Array.isArray(parsed) && parsed.length === expectedLength ? parsed : null;
  } catch {
    return null;
  }
}

export function pageResult(rows, limit, mapper, cursorValues) {
  const hasMore = rows.length > limit;
  const visible = hasMore ? rows.slice(0, limit) : rows;
  const last = visible.at(-1);
  return {
    items: visible.map(mapper),
    nextCursor: hasMore && last ? encodeCursor(cursorValues(last)) : null,
  };
}
