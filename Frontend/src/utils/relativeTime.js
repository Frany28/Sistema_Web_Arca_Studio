export function formatRelativeTime(value, now = Date.now(), fallback = "Sin fecha") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return fallback;
  }

  const minutes = Math.max(Math.floor((now - timestamp) / 60000), 0);

  if (minutes < 1) return "Hace menos de 1 min";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}
