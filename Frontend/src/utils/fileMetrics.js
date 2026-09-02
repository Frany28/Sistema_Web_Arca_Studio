export function formatStorage(bytes, { maximumFractionDigits } = {}) {
  const value = Number(bytes) || 0;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let amount = value;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  const digits = maximumFractionDigits ?? (amount >= 10 || unitIndex === 0 ? 0 : 1);
  return `${amount.toLocaleString("es-VE", { maximumFractionDigits: digits })} ${units[unitIndex]}`;
}

export function formatFileUploadDate(value, fallback = "Sin cargas") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date).replace(",", "");
}
