export const PROJECT_TYPE_LABELS = {
  commercial: "Comercial",
  corporate: "Corporativo",
  residential: "Residencial",
  stands_exhibitions: "Stands y exhibiciones",
};

export function getProjectTypeLabel(value, fallback = "-") {
  return PROJECT_TYPE_LABELS[value] || value || fallback;
}

export function getProjectTypeDisplay(value) {
  const label = getProjectTypeLabel(value, "");
  return label ? `Proyecto ${label}` : "Tipo de proyecto no disponible";
}

export function buildShowcasePages(items, itemsPerPage) {
  const safeItems = Array.isArray(items) ? items : [];
  const safePageSize = Math.max(Number(itemsPerPage) || 1, 1);
  const pages = [];

  for (let index = 0; index < safeItems.length; index += safePageSize) {
    pages.push(safeItems.slice(index, index + safePageSize));
  }

  return pages;
}

export function getShowcaseLayout(viewportWidth, itemCount) {
  if (itemCount === 1) {
    return { columns: 1, itemsPerPage: 1, mode: "single" };
  }

  if (viewportWidth < 768) {
    return { columns: 1, itemsPerPage: 2, mode: "mobile" };
  }

  if (viewportWidth < 1280) {
    return { columns: 3, itemsPerPage: 3, mode: "tablet" };
  }

  return { columns: 3, itemsPerPage: 3, mode: "desktop" };
}

export function getShowcaseCardHeight(mode, globalIndex) {
  if (mode === "desktop") return 273;
  if (mode === "mobile") return globalIndex % 2 === 0 ? 465 : 273;
  return 465;
}
