export function getFileDisplayName(value, fallback = "Archivo") {
  const fileName = String(value || "").trim();

  if (!fileName) return fallback;

  return fileName.replace(/\.[^./\\]+$/, "") || fileName;
}
