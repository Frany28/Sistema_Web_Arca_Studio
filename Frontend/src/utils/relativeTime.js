const MINUTE_IN_MS = 60_000;
const HOUR_IN_MINUTES = 60;
const DAY_IN_HOURS = 24;
const RELATIVE_DAY_LIMIT = 30;
const ONE_MONTH_DAY_LIMIT = 60;

function pluralize(value, singular, plural) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function formatExactDate(date, now) {
  const includeYear = date.getFullYear() !== new Date(now).getFullYear();
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);

  return formattedDate.replaceAll(".", "");
}

function resolveTimestamp(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return timestamp;
}

export function formatRelativeTime(value, now = Date.now(), fallback = "Sin fecha") {
  const timestamp = resolveTimestamp(value);
  if (timestamp === null) return fallback;

  const minutes = Math.max(Math.floor((now - timestamp) / MINUTE_IN_MS), 0);

  if (minutes < 1) return "Hace menos de 1 min";
  if (minutes < HOUR_IN_MINUTES) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / HOUR_IN_MINUTES);
  if (hours < DAY_IN_HOURS) return `Hace ${hours} h`;

  const days = Math.floor(hours / DAY_IN_HOURS);
  return `Hace ${days} d`;
}

export function formatHumanDate(value, now = Date.now(), fallback = "Sin fecha") {
  const timestamp = resolveTimestamp(value);
  if (timestamp === null) return fallback;

  const minutes = Math.max(Math.floor((now - timestamp) / MINUTE_IN_MS), 0);

  if (minutes < 1) return "Hace menos de un minuto";
  if (minutes < HOUR_IN_MINUTES) {
    return `Hace ${pluralize(minutes, "minuto", "minutos")}`;
  }

  const hours = Math.floor(minutes / HOUR_IN_MINUTES);
  if (hours < DAY_IN_HOURS) {
    return `Hace ${pluralize(hours, "hora", "horas")}`;
  }

  const days = Math.floor(hours / DAY_IN_HOURS);
  if (days <= RELATIVE_DAY_LIMIT) {
    return `Hace ${pluralize(days, "día", "días")}`;
  }

  if (days < ONE_MONTH_DAY_LIMIT) {
    return "Hace un mes";
  }

  return formatExactDate(new Date(timestamp), now);
}
